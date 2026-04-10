import { useState, useRef, useEffect } from "react";
import { searchTickers } from "../data/tickerDb";
import TickerBrowser from "./TickerBrowser";

export default function PortfolioForm({ portfolio, setPortfolio, interactive }) {
  const [tickerInput, setTickerInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const totalWeight = portfolio.reduce((s, p) => s + p.weight, 0);
  const isValid = Math.abs(totalWeight - 100) < 0.5;

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addTicker = (ticker) => {
    const upper = ticker.trim().toUpperCase();
    if (!upper || portfolio.some((p) => p.ticker === upper)) return;
    setPortfolio([...portfolio, { ticker: upper, weight: 0 }]);
    setTickerInput("");
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightIdx(-1);
  };

  const removeTicker = (ticker) =>
    setPortfolio(portfolio.filter((p) => p.ticker !== ticker));

  const updateWeight = (ticker, weight) => {
    const clamped = Math.max(0, Math.min(100, weight));
    if (portfolio.length === 2) {
      setPortfolio(
        portfolio.map((p) =>
          p.ticker === ticker
            ? { ...p, weight: clamped }
            : { ...p, weight: Math.round((100 - clamped) * 10) / 10 }
        )
      );
    } else {
      setPortfolio(
        portfolio.map((p) =>
          p.ticker === ticker ? { ...p, weight: clamped } : p
        )
      );
    }
  };

  const distributeEvenly = () => {
    if (!portfolio.length) return;
    const w = Math.floor((100 / portfolio.length) * 10) / 10;
    const last = +(100 - w * (portfolio.length - 1)).toFixed(1);
    setPortfolio(
      portfolio.map((p, i) => ({
        ...p,
        weight: i === portfolio.length - 1 ? last : w,
      }))
    );
  };

  const handleInputChange = (val) => {
    setTickerInput(val);
    if (val.trim().length > 0) {
      const existing = new Set(portfolio.map((p) => p.ticker.toUpperCase()));
      const results = searchTickers(val).filter((t) => !existing.has(t.ticker.toUpperCase()));
      setSuggestions(results.slice(0, 6));
      setShowSuggestions(true);
      setHighlightIdx(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") addTicker(tickerInput);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIdx >= 0) {
        addTicker(suggestions[highlightIdx].ticker);
      } else {
        addTicker(tickerInput);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div>
      <TickerBrowser
        open={showBrowser}
        onClose={() => setShowBrowser(false)}
        onSelect={(ticker) => addTicker(ticker)}
        existingTickers={portfolio.map((p) => p.ticker)}
      />

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">포트폴리오</h2>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isValid ? "bg-[#E8F3FF] text-[#3182F6]" : "bg-red-50 text-[#F04452]"
          }`}
        >
          {totalWeight.toFixed(1)}%
        </span>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {["QLD", "SCHD", "SPY", "QQQ", "VTI", "TQQQ", "AAPL", "NVDA"]
          .filter((t) => !portfolio.some((p) => p.ticker === t))
          .slice(0, 6)
          .map((t) => (
            <button
              key={t}
              onClick={() => addTicker(t)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 hover:bg-[#E8F3FF] hover:text-[#3182F6] transition-all"
            >
              + {t}
            </button>
          ))}
      </div>

      {/* Search input with autocomplete */}
      <div className="relative mb-3">
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={tickerInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (tickerInput.trim() && suggestions.length) setShowSuggestions(true);
              }}
              placeholder="티커 또는 이름 검색 (예: 애플, QQQ)"
              className="w-full h-9 pl-8 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-xs placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20 focus:border-[#3182F6] transition-all"
            />
          </div>
          <button
            onClick={() => setShowBrowser(true)}
            className="h-9 px-2.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:bg-[#E8F3FF] hover:text-[#3182F6] hover:border-[#3182F6]/20 transition-all shrink-0"
            title="전체 티커 탐색"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => addTicker(tickerInput)}
            className="h-9 px-3 rounded-lg bg-[#3182F6] text-white text-xs font-semibold hover:bg-[#2570DF] active:scale-[0.97] transition-all shrink-0"
          >
            추가
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-[88px] mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-30 overflow-hidden"
          >
            {suggestions.map((item, i) => (
              <button
                key={item.ticker}
                onClick={() => addTicker(item.ticker)}
                onMouseEnter={() => setHighlightIdx(i)}
                className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
                  i === highlightIdx ? "bg-[#E8F3FF]" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-xs font-bold text-[#3182F6] w-14 shrink-0">
                  {item.ticker.replace(".KS", "")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-gray-700 truncate">{item.nameKr}</p>
                  <p className="text-[10px] text-gray-400 truncate">{item.name}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ticker list with sliders */}
      <div className="space-y-2">
        {portfolio.map((item) => (
          <div key={item.ticker} className="group">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#3182F6] w-12 shrink-0">
                {item.ticker.replace(".KS", "")}
              </span>
              <div className="flex-1" />
              <input
                type="number"
                value={item.weight}
                onChange={(e) =>
                  updateWeight(item.ticker, parseFloat(e.target.value) || 0)
                }
                className="w-14 h-6 text-center rounded bg-white border border-gray-200 text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#3182F6]/30 transition-all"
                min={0}
                max={100}
                step={1}
              />
              <span className="text-[10px] text-gray-400">%</span>
              <button
                onClick={() => removeTicker(item.ticker)}
                className="w-6 h-6 sm:w-5 sm:h-5 rounded flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-[#F04452] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
              >
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {interactive && (
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={item.weight}
                onChange={(e) => updateWeight(item.ticker, parseInt(e.target.value))}
                className="w-full h-2 sm:h-1.5 rounded-full appearance-none cursor-pointer accent-[#3182F6] bg-gray-100"
              />
            )}
          </div>
        ))}
      </div>

      {portfolio.length > 0 && (
        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={distributeEvenly}
            className="text-[11px] text-gray-400 hover:text-[#3182F6] font-medium transition-colors"
          >
            균등 분배
          </button>
          {!isValid && (
            <p className="text-[11px] text-[#F04452] font-medium">합계 100% 필요</p>
          )}
        </div>
      )}
    </div>
  );
}
