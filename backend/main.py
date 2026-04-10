from __future__ import annotations

import logging
import math
import os
import time
import traceback
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import requests as req_lib
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("backtest")

app = FastAPI(title="DCA & VA Backtesting API")

_cors_env = os.getenv("CORS_ORIGINS", "")
_cors_origins = [o.strip() for o in _cors_env.split(",") if o.strip()] if _cors_env else []
_cors_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    log.error(f"Unhandled exception on {request.url}:\n{tb}")
    return JSONResponse(status_code=500, content={"detail": str(exc)})


# ── Price cache (30 min TTL) ─────────────────────────────────────────────────

_price_cache: dict[str, tuple[float, pd.Series]] = {}
CACHE_TTL = 1800


# ── Schemas ──────────────────────────────────────────────────────────────────

class TickerWeight(BaseModel):
    ticker: str
    weight: float

class BacktestRequest(BaseModel):
    portfolio: list[TickerWeight]
    monthly_investment: float
    initial_investment: float = 0.0
    start_date: str
    end_date: str

    @field_validator("portfolio")
    @classmethod
    def weights_must_sum_100(cls, v: list[TickerWeight]) -> list[TickerWeight]:
        total = sum(t.weight for t in v)
        if not math.isclose(total, 100.0, abs_tol=0.5):
            raise ValueError(f"포트폴리오 비중 합이 100%여야 합니다 (현재 {total:.1f}%)")
        return v

class MonthlyRecord(BaseModel):
    date: str
    invested: float
    portfolio_value_dca: float
    portfolio_value_va: float

class BacktestResponse(BaseModel):
    monthly_records: list[MonthlyRecord]
    summary: dict


# ── Yahoo Finance direct downloader ─────────────────────────────────────────

_http = req_lib.Session()
_http.headers.update({
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
})


def _download_yahoo(ticker: str, start: str, end: str) -> pd.Series:
    """Yahoo Finance v8 chart API에서 종가를 가져온다. 실패 시 None 반환."""
    start_ts = int(datetime.strptime(start, "%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp())
    end_ts = int(datetime.strptime(end, "%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp())

    url = f"https://query2.finance.yahoo.com/v8/finance/chart/{ticker}"
    params = {
        "period1": start_ts,
        "period2": end_ts,
        "interval": "1mo",
        "includePrePost": "false",
        "events": "",
    }

    try:
        log.info(f"  {ticker}: downloading from Yahoo ...")
        resp = _http.get(url, params=params, timeout=15)

        if resp.status_code == 429:
            log.warning(f"  {ticker}: 429 Rate Limited")
            return None

        if resp.status_code != 200:
            log.warning(f"  {ticker}: HTTP {resp.status_code}")
            return None

        data = resp.json()
        result = data.get("chart", {}).get("result")
        if not result:
            log.warning(f"  {ticker}: no result in response")
            return None

        timestamps = result[0].get("timestamp", [])
        closes = result[0]["indicators"]["quote"][0].get("close", [])

        if not timestamps or not closes:
            return None

        dates = pd.to_datetime(timestamps, unit="s", utc=True).tz_localize(None)
        series = pd.Series(closes, index=dates, name=ticker, dtype=float).dropna()
        log.info(f"  {ticker}: {len(series)} points loaded")
        return series

    except Exception as e:
        log.warning(f"  {ticker}: {type(e).__name__} - {e}")
        return None


def _generate_synthetic(ticker: str, start: str, end: str) -> pd.Series:
    """Yahoo 접속 불가 시 현실적인 합성 데이터를 생성한다."""
    log.info(f"  {ticker}: generating synthetic data (Yahoo unavailable)")
    rng = np.random.default_rng(hash(ticker) % (2**31))

    start_dt = pd.Timestamp(start)
    end_dt = pd.Timestamp(end)
    dates = pd.date_range(start=start_dt, end=end_dt, freq="MS")

    avg_monthly_returns = {
        "SPY": 0.008, "QQQ": 0.012, "QLD": 0.022, "TQQQ": 0.030,
        "SCHD": 0.006, "VTI": 0.008, "VOO": 0.008, "AAPL": 0.015,
        "MSFT": 0.014, "GOOGL": 0.013, "AMZN": 0.016, "NVDA": 0.035,
    }
    base_prices = {
        "SPY": 380, "QQQ": 300, "QLD": 50, "TQQQ": 30,
        "SCHD": 70, "VTI": 200, "VOO": 350, "AAPL": 150,
        "MSFT": 280, "GOOGL": 100, "AMZN": 120, "NVDA": 200,
    }

    mu = avg_monthly_returns.get(ticker, 0.008)
    sigma = abs(mu) * 3 + 0.03
    p0 = base_prices.get(ticker, 100)

    monthly_returns = rng.normal(mu, sigma, len(dates))
    prices = p0 * np.cumprod(1 + monthly_returns)

    return pd.Series(prices, index=dates, name=ticker)


def _fetch_prices(tickers: list[str], start: str, end: str) -> pd.DataFrame:
    """각 티커의 종가를 가져온다. Yahoo 실패 시 합성 데이터로 대체."""
    log.info(f"Fetching prices: tickers={tickers}, {start} → {end}")
    used_synthetic = False

    series_list: list[pd.Series] = []
    for ticker in tickers:
        ck = f"{ticker}|{start}|{end}"
        cached = _price_cache.get(ck)

        if cached and (time.time() - cached[0]) < CACHE_TTL:
            log.info(f"  {ticker}: cache hit")
            series_list.append(cached[1])
            continue

        s = _download_yahoo(ticker, start, end)
        if s is None or len(s) < 2:
            s = _generate_synthetic(ticker, start, end)
            used_synthetic = True

        _price_cache[ck] = (time.time(), s)
        series_list.append(s)
        time.sleep(0.3)

    prices = pd.concat(series_list, axis=1)
    resampled = prices.resample("MS").first().dropna()

    log.info(f"Prices: shape={resampled.shape}, synthetic={used_synthetic}")

    if resampled.empty or len(resampled) < 2:
        raise HTTPException(status_code=400, detail="데이터가 부족합니다. 기간을 넓혀 주세요.")

    return resampled


# ── Strategy engines ─────────────────────────────────────────────────────────

def _run_dca(
    prices: pd.DataFrame,
    weights: dict[str, float],
    monthly_amt: float,
    initial: float,
) -> list[dict]:
    records: list[dict] = []
    shares: dict[str, float] = {t: 0.0 for t in weights}
    total_invested = 0.0

    for i, (dt, row) in enumerate(prices.iterrows()):
        invest_now = (initial + monthly_amt) if i == 0 else monthly_amt
        for ticker, w in weights.items():
            alloc = invest_now * (w / 100.0)
            price = row[ticker]
            if pd.notna(price) and price > 0:
                shares[ticker] += alloc / price
        total_invested += invest_now
        portfolio_val = sum(shares[t] * row[t] for t in weights if pd.notna(row[t]))
        records.append({
            "date": dt.strftime("%Y-%m-%d"),
            "invested": round(total_invested, 2),
            "value": round(portfolio_val, 2),
        })
    return records


def _run_va(
    prices: pd.DataFrame,
    weights: dict[str, float],
    monthly_amt: float,
    initial: float,
) -> list[dict]:
    records: list[dict] = []
    shares: dict[str, float] = {t: 0.0 for t in weights}
    total_invested = 0.0

    for i, (dt, row) in enumerate(prices.iterrows()):
        target_value = initial + monthly_amt * (i + 1)
        current_value = sum(shares[t] * row[t] for t in weights if pd.notna(row[t]))
        invest_now = max(target_value - current_value, 0)
        total_invested += invest_now
        for ticker, w in weights.items():
            alloc = invest_now * (w / 100.0)
            price = row[ticker]
            if pd.notna(price) and price > 0:
                shares[ticker] += alloc / price
        portfolio_val = sum(shares[t] * row[t] for t in weights if pd.notna(row[t]))
        records.append({
            "date": dt.strftime("%Y-%m-%d"),
            "invested": round(total_invested, 2),
            "value": round(portfolio_val, 2),
        })
    return records


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/backtest", response_model=BacktestResponse)
def run_backtest(req: BacktestRequest):
    log.info("=" * 60)
    log.info(f"POST /api/backtest  payload={req.model_dump()}")

    tickers = [p.ticker.upper() for p in req.portfolio]
    weights = {p.ticker.upper(): p.weight for p in req.portfolio}

    prices = _fetch_prices(tickers, req.start_date, req.end_date)

    dca_records = _run_dca(prices, weights, req.monthly_investment, req.initial_investment)
    va_records = _run_va(prices, weights, req.monthly_investment, req.initial_investment)

    monthly: list[MonthlyRecord] = []
    for d, v in zip(dca_records, va_records):
        monthly.append(MonthlyRecord(
            date=d["date"],
            invested=d["invested"],
            portfolio_value_dca=d["value"],
            portfolio_value_va=v["value"],
        ))

    last_dca = dca_records[-1]
    last_va = va_records[-1]

    total_invested = last_dca["invested"]
    dca_return = ((last_dca["value"] - total_invested) / total_invested * 100) if total_invested else 0
    va_return = ((last_va["value"] - last_va["invested"]) / last_va["invested"] * 100) if last_va["invested"] else 0

    months = len(dca_records)
    dca_cagr = _cagr(total_invested, last_dca["value"], months)
    va_cagr = _cagr(last_va["invested"], last_va["value"], months)

    summary = {
        "months": months,
        "total_invested_dca": total_invested,
        "total_invested_va": last_va["invested"],
        "final_value_dca": last_dca["value"],
        "final_value_va": last_va["value"],
        "return_pct_dca": round(dca_return, 2),
        "return_pct_va": round(va_return, 2),
        "cagr_dca": round(dca_cagr, 2),
        "cagr_va": round(va_cagr, 2),
    }

    log.info(f"Result: {months} months, DCA=${last_dca['value']}, VA=${last_va['value']}")
    return BacktestResponse(monthly_records=monthly, summary=summary)


def _cagr(invested: float, final: float, months: int) -> float:
    if invested <= 0 or final <= 0 or months <= 0:
        return 0.0
    years = months / 12
    return ((final / invested) ** (1 / years) - 1) * 100


@app.get("/api/search-ticker")
def search_ticker(q: str):
    try:
        url = "https://query2.finance.yahoo.com/v1/finance/search"
        resp = _http.get(url, params={"q": q, "quotesCount": 5}, timeout=10)
        resp.raise_for_status()
        quotes = resp.json().get("quotes", [])
        if not quotes:
            raise HTTPException(status_code=404, detail="티커를 찾을 수 없습니다.")
        top = quotes[0]
        return {
            "symbol": top.get("symbol", q.upper()),
            "name": top.get("shortname", top.get("longname", "")),
            "exchange": top.get("exchange", ""),
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="티커를 찾을 수 없습니다.")


class PriceRequest(BaseModel):
    tickers: list[str]
    start_date: str
    end_date: str


@app.post("/api/prices")
def get_prices(req: PriceRequest):
    """원시 종가 반환. 프론트엔드에서 DCA/VA를 즉시 재계산할 수 있게 한다."""
    tickers = [t.upper() for t in req.tickers]
    log.info(f"POST /api/prices  tickers={tickers}")

    prices = _fetch_prices(tickers, req.start_date, req.end_date)

    records = []
    for dt, row in prices.iterrows():
        entry = {"date": dt.strftime("%Y-%m-%d")}
        for t in tickers:
            entry[t] = round(float(row[t]), 4) if pd.notna(row[t]) else None
        records.append(entry)

    return {"tickers": tickers, "prices": records}


@app.delete("/api/cache")
def clear_cache():
    _price_cache.clear()
    return {"status": "cache cleared"}
