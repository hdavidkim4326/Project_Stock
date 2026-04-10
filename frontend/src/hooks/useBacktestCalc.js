import { useMemo } from "react";

function runDCA(prices, weights, monthlyAmt, initialAmt) {
  const tickers = Object.keys(weights);
  const shares = Object.fromEntries(tickers.map((t) => [t, 0]));
  let totalInvested = 0;
  const records = [];

  for (let i = 0; i < prices.length; i++) {
    const row = prices[i];
    const investNow = i === 0 ? initialAmt + monthlyAmt : monthlyAmt;

    for (const ticker of tickers) {
      const alloc = investNow * (weights[ticker] / 100);
      const price = row[ticker];
      if (price && price > 0) shares[ticker] += alloc / price;
    }

    totalInvested += investNow;

    let value = 0;
    for (const ticker of tickers) {
      if (row[ticker]) value += shares[ticker] * row[ticker];
    }

    records.push({
      date: row.date,
      invested: Math.round(totalInvested * 100) / 100,
      value: Math.round(value * 100) / 100,
      monthlyInvest: Math.round(investNow * 100) / 100,
    });
  }

  return records;
}

function runVA(prices, weights, monthlyAmt, initialAmt) {
  const tickers = Object.keys(weights);
  const shares = Object.fromEntries(tickers.map((t) => [t, 0]));
  let totalInvested = 0;
  const records = [];

  for (let i = 0; i < prices.length; i++) {
    const row = prices[i];
    const targetValue = initialAmt + monthlyAmt * (i + 1);

    let currentValue = 0;
    for (const ticker of tickers) {
      if (row[ticker]) currentValue += shares[ticker] * row[ticker];
    }

    const investNow = Math.max(targetValue - currentValue, 0);
    totalInvested += investNow;

    for (const ticker of tickers) {
      const alloc = investNow * (weights[ticker] / 100);
      const price = row[ticker];
      if (price && price > 0) shares[ticker] += alloc / price;
    }

    let value = 0;
    for (const ticker of tickers) {
      if (row[ticker]) value += shares[ticker] * row[ticker];
    }

    records.push({
      date: row.date,
      invested: Math.round(totalInvested * 100) / 100,
      value: Math.round(value * 100) / 100,
      monthlyInvest: Math.round(investNow * 100) / 100,
    });
  }

  return records;
}

function calcMDD(records) {
  if (records.length < 2) return { mdd: 0, detail: null };

  let peak = -Infinity;
  let peakIdx = 0;
  let maxDrawdown = 0;
  let mddPeakIdx = 0;
  let mddTroughIdx = 0;

  for (let i = 0; i < records.length; i++) {
    if (records[i].value > peak) {
      peak = records[i].value;
      peakIdx = i;
    }
    const dd = (records[i].value - peak) / peak;
    if (dd < maxDrawdown) {
      maxDrawdown = dd;
      mddPeakIdx = peakIdx;
      mddTroughIdx = i;
    }
  }

  const mdd = Math.round(maxDrawdown * 10000) / 100;
  if (mdd === 0) return { mdd: 0, detail: null };

  return {
    mdd,
    detail: {
      peakDate: records[mddPeakIdx].date,
      troughDate: records[mddTroughIdx].date,
      peakValue: records[mddPeakIdx].value,
      troughValue: records[mddTroughIdx].value,
    },
  };
}

function calcSummary(records) {
  if (!records.length) return null;
  const last = records[records.length - 1];
  const months = records.length;
  const returnPct = last.invested > 0
    ? Math.round(((last.value - last.invested) / last.invested) * 10000) / 100
    : 0;
  const years = months / 12;
  const cagr = last.invested > 0 && last.value > 0 && years > 0
    ? Math.round(((last.value / last.invested) ** (1 / years) - 1) * 10000) / 100
    : 0;
  const { mdd, detail: mddDetail } = calcMDD(records);

  return {
    months,
    totalInvested: last.invested,
    finalValue: last.value,
    returnPct,
    cagr,
    mdd,
    mddDetail,
  };
}

export default function useBacktestCalc(rawPrices, portfolio, config, strategy, startIdx) {
  return useMemo(() => {
    if (!rawPrices || rawPrices.length < 2 || !portfolio.length) return null;

    const sliced = rawPrices.slice(startIdx);
    if (sliced.length < 2) return null;

    const weights = {};
    for (const p of portfolio) {
      weights[p.ticker] = p.weight;
    }

    const run = strategy === "va" ? runVA : runDCA;
    const records = run(sliced, weights, config.monthlyInvestment, config.initialInvestment);
    const summary = calcSummary(records);

    const monthlyRecords = records.map((r) => ({
      date: r.date,
      invested: r.invested,
      monthlyInvest: r.monthlyInvest,
      portfolio_value_dca: strategy === "dca" ? r.value : r.invested,
      portfolio_value_va: strategy === "va" ? r.value : r.invested,
    }));

    return {
      monthly_records: monthlyRecords,
      records,
      summary: {
        months: summary.months,
        total_invested_dca: strategy === "dca" ? summary.totalInvested : 0,
        total_invested_va: strategy === "va" ? summary.totalInvested : 0,
        final_value_dca: strategy === "dca" ? summary.finalValue : 0,
        final_value_va: strategy === "va" ? summary.finalValue : 0,
        return_pct_dca: strategy === "dca" ? summary.returnPct : 0,
        return_pct_va: strategy === "va" ? summary.returnPct : 0,
        cagr_dca: strategy === "dca" ? summary.cagr : 0,
        cagr_va: strategy === "va" ? summary.cagr : 0,
        mdd: summary.mdd,
        mddDetail: summary.mddDetail,
      },
    };
  }, [rawPrices, portfolio, config.monthlyInvestment, config.initialInvestment, strategy, startIdx]);
}
