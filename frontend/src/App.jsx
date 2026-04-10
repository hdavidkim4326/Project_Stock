import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import Header from "./components/Header";
import PortfolioForm from "./components/PortfolioForm";
import BacktestForm from "./components/BacktestForm";
import SavedPortfolios from "./components/SavedPortfolios";
import ResultChart from "./components/ResultChart";
import SummaryCards from "./components/SummaryCards";
import useBacktestCalc from "./hooks/useBacktestCalc";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8003";
const IS_PROD = API_BASE.includes("onrender.com");

const COLORS = [
  "#3182F6", "#30B780", "#8B5CF6", "#F59E0B",
  "#EC4899", "#06B6D4", "#EF4444", "#6366F1",
];

let nextId = 1;

function getDefaultDates() {
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 20);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

function makePortfolioName(portfolio, strategy) {
  const tickers = portfolio.map((p) => `${p.ticker} ${p.weight}%`).join(" + ");
  const label = strategy === "dca" ? "DCA" : "VA";
  return `${tickers} (${label})`;
}

export default function App() {
  const { startDate, endDate } = getDefaultDates();

  const [portfolio, setPortfolio] = useState([
    { ticker: "QLD", weight: 60 },
    { ticker: "SCHD", weight: 40 },
  ]);

  const [config, setConfig] = useState({
    monthlyInvestment: 500,
    initialInvestment: 1000,
    startDate,
    endDate,
  });

  const [strategy, setStrategy] = useState("dca");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1380);
  const fx = currency === "KRW" ? exchangeRate : 1;

  const [backendStatus, setBackendStatus] = useState(IS_PROD ? "waking" : "ready");
  const wakeAttempts = useRef(0);

  useEffect(() => {
    if (!IS_PROD) return;
    let cancelled = false;

    const ping = async () => {
      try {
        await axios.get(`${API_BASE}/api/health`, { timeout: 10000 });
        if (!cancelled) setBackendStatus("ready");
      } catch {
        wakeAttempts.current += 1;
        if (!cancelled && wakeAttempts.current < 12) {
          setTimeout(ping, 5000);
        } else if (!cancelled) {
          setBackendStatus("failed");
        }
      }
    };

    ping();
    return () => { cancelled = true; };
  }, []);

  // Raw price data from backend (loaded once)
  const [rawPrices, setRawPrices] = useState(null);
  const [startIdx, setStartIdx] = useState(0);

  // Saved portfolios for comparison
  const [savedResults, setSavedResults] = useState([]);

  const totalWeight = portfolio.reduce((s, p) => s + p.weight, 0);
  const portfolioValid = portfolio.length > 0 && Math.abs(totalWeight - 100) < 0.5;

  // Live calculation: runs instantly whenever sliders change
  const liveResult = useBacktestCalc(rawPrices, portfolio, config, strategy, startIdx);

  const loadPrices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tickers = portfolio.map((p) => p.ticker);
      const { data } = await axios.post(`${API_BASE}/api/prices`, {
        tickers,
        start_date: config.startDate,
        end_date: config.endDate,
      });
      setRawPrices(data.prices);
      setStartIdx(0);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "데이터 로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [portfolio, config.startDate, config.endDate]);

  const saveResult = useCallback(() => {
    if (!liveResult) return;
    const color = COLORS[savedResults.length % COLORS.length];
    const startDate = rawPrices?.[startIdx]?.date ?? "";
    setSavedResults((prev) => [
      ...prev,
      {
        id: nextId++,
        name: makePortfolioName(portfolio, strategy),
        color,
        visible: true,
        strategy,
        portfolio: [...portfolio],
        result: liveResult,
      },
    ]);
  }, [liveResult, portfolio, strategy, savedResults.length, rawPrices, startIdx]);

  const toggleVisibility = useCallback((id) => {
    setSavedResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, visible: !r.visible } : r))
    );
  }, []);

  const deleteResult = useCallback((id) => {
    setSavedResults((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const visiblePortfolios = savedResults.filter((r) => r.visible);
  const pricesLoaded = !!rawPrices;

  const liveColor = COLORS[savedResults.length % COLORS.length];
  const liveName = liveResult ? makePortfolioName(portfolio, strategy) : "";

  const unsavedForChart = liveResult
    ? { strategy, result: liveResult, color: liveColor, name: liveName }
    : null;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header
        currency={currency}
        setCurrency={setCurrency}
        exchangeRate={exchangeRate}
        setExchangeRate={setExchangeRate}
      />

      {backendStatus === "waking" && (
        <div className="bg-[#3182F6] text-white text-center py-2 px-4 text-xs font-medium flex items-center justify-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          서버를 깨우는 중입니다... 무료 서버라 최대 1분 정도 걸릴 수 있어요
        </div>
      )}
      {backendStatus === "failed" && (
        <div className="bg-[#F04452] text-white text-center py-2 px-4 text-xs font-medium">
          서버에 연결할 수 없습니다. 잠시 후 새로고침해 주세요.
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* ── Left Sidebar ── */}
        <aside className="w-full lg:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white lg:overflow-y-auto">
          <div className="p-4 lg:p-5 space-y-4">
            <PortfolioForm
              portfolio={portfolio}
              setPortfolio={setPortfolio}
              interactive={pricesLoaded}
            />

            <div className="border-t border-gray-100" />

            <BacktestForm
              config={config}
              setConfig={setConfig}
              strategy={strategy}
              setStrategy={setStrategy}
              onLoadPrices={loadPrices}
              onSave={saveResult}
              loading={loading}
              portfolioValid={portfolioValid}
              hasUnsaved={!!liveResult}
              pricesLoaded={pricesLoaded}
              rawPrices={rawPrices}
              startIdx={startIdx}
              setStartIdx={setStartIdx}
              currency={currency}
              fx={fx}
            />
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 lg:overflow-y-auto">
          <div className="p-4 lg:p-6 space-y-4 max-w-[1100px]">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <p className="text-sm text-[#F04452] font-medium">{error}</p>
              </div>
            )}

            {savedResults.length > 0 && (
              <SavedPortfolios
                items={savedResults}
                onToggle={toggleVisibility}
                onDelete={deleteResult}
              />
            )}

            {liveResult || savedResults.length > 0 ? (
              <>
                <ResultChart
                  savedPortfolios={visiblePortfolios}
                  unsavedResult={unsavedForChart}
                  fx={fx}
                  currency={currency}
                />
                <SummaryCards
                  savedPortfolios={visiblePortfolios}
                  unsavedResult={unsavedForChart}
                  fx={fx}
                  currency={currency}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-48 lg:h-[calc(100vh-180px)]">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-300">
                    포트폴리오를 설정하고
                  </p>
                  <p className="text-sm font-semibold text-gray-300 mt-1">
                    "데이터 로드" 를 누르세요
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
