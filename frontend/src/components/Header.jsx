import { useState } from "react";

function formatTime(date) {
  if (!date) return "";
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${m}.${d} ${h}:${min}`;
}

export default function Header({
  currency,
  setCurrency,
  exchangeRate,
  setExchangeRate,
  dataRange,
  lastFetchedAt,
  onRefresh,
  refreshing,
}) {
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

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Data status chip */}
          {dataRange && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
              title="오늘까지 최신 데이터 새로고침"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#30B780] shrink-0" />
              <span className="hidden sm:inline text-[11px] text-gray-500 font-medium">
                {dataRange.start} – {dataRange.end}
              </span>
              {lastFetchedAt && (
                <span className="text-[10px] text-gray-400">
                  <span className="hidden sm:inline">· </span>{formatTime(lastFetchedAt)}
                </span>
              )}
              <svg
                width="12"
                height="12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`text-gray-400 group-hover:text-[#3182F6] transition-colors ${refreshing ? "animate-spin" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.49 9A9 9 0 005.64 5.64L4 9m16 6l-1.64 3.36A9 9 0 013.51 15" />
              </svg>
            </button>
          )}

          {/* Divider when data is loaded */}
          {dataRange && (
            <div className="w-px h-5 bg-gray-200" />
          )}

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
      </div>
    </header>
  );
}
