import { useState } from "react";

export default function Header({ currency, setCurrency, exchangeRate, setExchangeRate }) {
  const [editingRate, setEditingRate] = useState(false);
  const [rateDraft, setRateDraft] = useState("");

  const startEdit = () => {
    setRateDraft(String(exchangeRate));
    setEditingRate(true);
  };

  const commitRate = () => {
    const v = parseFloat(rateDraft);
    if (!isNaN(v) && v > 0) setExchangeRate(Math.round(v * 100) / 100);
    setEditingRate(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3182F6] flex items-center justify-center">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-sm sm:text-lg font-bold tracking-tight text-gray-900">
            투자 백테스터
          </h1>
        </div>

        {/* Currency toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setCurrency("USD")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-[12px] font-semibold transition-all ${
                currency === "USD"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              $ USD
            </button>
            <button
              onClick={() => setCurrency("KRW")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-[12px] font-semibold transition-all ${
                currency === "KRW"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              ₩ KRW
            </button>
          </div>

          {currency === "KRW" && (
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-400">
              <span className="hidden sm:inline">1$ =</span>
              {editingRate ? (
                <input
                  type="number"
                  autoFocus
                  value={rateDraft}
                  onChange={(e) => setRateDraft(e.target.value)}
                  onBlur={commitRate}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRate();
                    if (e.key === "Escape") setEditingRate(false);
                  }}
                  className="w-16 h-6 text-center rounded bg-white border border-[#3182F6] text-xs font-bold text-gray-700 focus:outline-none"
                />
              ) : (
                <button
                  onClick={startEdit}
                  className="font-bold text-gray-600 hover:text-[#3182F6] px-1 py-0.5 rounded hover:bg-[#E8F3FF] transition-colors cursor-text"
                  title="클릭하여 환율 수정"
                >
                  ₩{exchangeRate.toLocaleString()}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
