import { useState, useEffect, useRef } from "react";
import { CATEGORIES, searchTickers } from "../data/tickerDb";

const CATEGORY_COLORS = {
  us_etf: "#3182F6",
  us_stock: "#8B5CF6",
  leverage: "#F59E0B",
  bond_commodity: "#30B780",
  kr_etf: "#EC4899",
};

export default function TickerBrowser({ open, onClose, onSelect, existingTickers }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveCategory("all");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const results = searchTickers(query, activeCategory);
  const alreadyAdded = new Set(existingTickers.map((t) => t.toUpperCase()));

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-[680px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-6 pt-5 pb-0 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">티커 검색</h2>
              <p className="text-xs text-gray-400 mt-0.5">이름, 티커, 태그로 검색하세요</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="애플, AAPL, 나스닥, 배당, 반도체 ..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-100 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20 focus:border-[#3182F6] transition-all"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-0 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3.5 py-2 text-[12px] font-semibold whitespace-nowrap border-b-2 transition-all ${
                    active
                      ? "border-[#3182F6] text-[#3182F6]"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {results.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-sm text-gray-300 font-medium">검색 결과가 없습니다</p>
                <p className="text-xs text-gray-300 mt-1">다른 키워드로 검색하거나 직접 티커를 입력하세요</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {results.map((item) => {
                const added = alreadyAdded.has(item.ticker.toUpperCase());
                const catColor = CATEGORY_COLORS[item.category] || "#6B7280";

                return (
                  <button
                    key={item.ticker}
                    onClick={() => {
                      if (!added) onSelect(item.ticker);
                    }}
                    disabled={added}
                    className={`text-left p-3 rounded-xl border transition-all group ${
                      added
                        ? "bg-gray-50 border-gray-100 opacity-50 cursor-default"
                        : "bg-white border-gray-100 hover:border-[#3182F6] hover:shadow-sm cursor-pointer active:scale-[0.98]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{item.ticker.replace(".KS", "")}</span>
                          {added && (
                            <span className="text-[9px] font-medium text-white bg-gray-300 px-1.5 py-0.5 rounded">추가됨</span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{item.nameKr}</p>
                        <p className="text-[10px] text-gray-400 truncate">{item.name}</p>
                      </div>
                      {!added && (
                        <div className="w-6 h-6 rounded-lg bg-[#E8F3FF] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2 mt-0.5">
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#3182F6" strokeWidth="2.5">
                            <path strokeLinecap="round" d="M12 5v14m-7-7h14" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: catColor + "15", color: catColor }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[11px] text-gray-400 text-center">
            {results.length}개 항목 · 목록에 없는 티커는 직접 입력할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
