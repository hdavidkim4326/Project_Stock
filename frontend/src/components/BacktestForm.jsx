import { useState } from "react";
import StrategyModal from "./StrategyModal";

const STRATEGIES = [
  { key: "dca", label: "DCA 정액 적립", desc: "매월 같은 금액 투자" },
  { key: "va", label: "VA 가치 분할", desc: "목표가치까지 차액 투자" },
];

function SliderField({ label, value, onChange, min, max, step, prefix, suffix, displayValue, editable = true, fx = 1 }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const displayed = displayValue ?? Math.round(value * fx).toLocaleString();

  const startEdit = () => {
    if (!editable) return;
    setDraft(String(Math.round(value * fx)));
    setEditing(true);
  };

  const commitEdit = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      const usdVal = fx > 1 ? parsed / fx : parsed;
      onChange(Math.max(min, Math.min(max, Math.round(usdVal / step) * step)));
    }
    setEditing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-medium text-gray-400">{label}</label>
        {editing ? (
          <div className="flex items-center gap-1">
            {prefix && <span className="text-xs text-gray-400">{prefix}</span>}
            <input
              type="number"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-24 h-6 text-right rounded bg-white border border-[#3182F6] text-xs font-bold text-gray-700 px-1.5 focus:outline-none"
            />
            {suffix && <span className="text-xs text-gray-400">{suffix}</span>}
          </div>
        ) : (
          <button
            onClick={startEdit}
            className={`text-xs font-bold text-gray-700 px-1.5 py-0.5 rounded hover:bg-[#E8F3FF] hover:text-[#3182F6] transition-colors ${editable ? "cursor-text" : "cursor-default"}`}
            title={editable ? "클릭하여 직접 입력" : ""}
          >
            {prefix}{displayed}{suffix}
          </button>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 sm:h-1.5 rounded-full appearance-none cursor-pointer accent-[#3182F6] bg-gray-100"
      />
    </div>
  );
}

export default function BacktestForm({
  config,
  setConfig,
  strategy,
  setStrategy,
  onLoadPrices,
  onSave,
  loading,
  portfolioValid,
  hasUnsaved,
  pricesLoaded,
  rawPrices,
  startIdx,
  setStartIdx,
  currency = "USD",
  fx = 1,
}) {
  const [showModal, setShowModal] = useState(false);
  const update = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));
  const sym = currency === "KRW" ? "₩" : "$";

  const maxStartIdx = rawPrices ? Math.max(0, rawPrices.length - 3) : 0;
  const startDateLabel = rawPrices && rawPrices[startIdx]
    ? rawPrices[startIdx].date.slice(0, 7)
    : "";

  return (
    <div className="space-y-4">
      <StrategyModal open={showModal} onClose={() => setShowModal(false)} />

      {/* Strategy toggle */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-900">투자 전략</h2>
          <button
            onClick={() => setShowModal(true)}
            className="text-[11px] font-medium text-gray-400 hover:text-[#3182F6] transition-colors flex items-center gap-1"
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <circle cx="12" cy="17" r="0.5" fill="currentColor" />
            </svg>
            전략 설명 보기
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {STRATEGIES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStrategy(s.key)}
              className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                strategy === s.key
                  ? "border-[#3182F6] bg-[#E8F3FF]"
                  : "border-gray-100 bg-gray-50 hover:border-gray-200"
              }`}
            >
              <span className={`text-xs font-bold block ${strategy === s.key ? "text-[#3182F6]" : "text-gray-600"}`}>
                {s.label}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5 block">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Settings - date pickers only shown before loading */}
      {!pricesLoaded ? (
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2">데이터 기간</h2>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">시작일</label>
              <input
                type="date"
                value={config.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20 focus:border-[#3182F6] transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">종료일</label>
              <input
                type="date"
                value={config.endDate}
                onChange={(e) => update("endDate", e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20 focus:border-[#3182F6] transition-all"
              />
            </div>
          </div>
          <button
            onClick={onLoadPrices}
            disabled={loading || !portfolioValid}
            className={`w-full h-12 sm:h-11 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98] ${
              loading || !portfolioValid
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#3182F6] hover:bg-[#2570DF] shadow-lg shadow-[#3182F6]/20"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                로딩 중...
              </span>
            ) : (
              "데이터 로드 & 분석 시작"
            )}
          </button>
        </div>
      ) : (
        <>
          {/* Interactive sliders */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3">
              투자 설정
              <span className="text-[10px] font-normal text-gray-400 ml-2">슬라이더로 실시간 조절</span>
            </h2>
            <div className="space-y-4">
              <SliderField
                label="월 적립 금액"
                value={config.monthlyInvestment}
                onChange={(v) => update("monthlyInvestment", v)}
                min={100}
                max={5000}
                step={50}
                prefix={sym}
                suffix=""
                fx={fx}
              />
              <SliderField
                label="초기 투자금"
                value={config.initialInvestment}
                onChange={(v) => update("initialInvestment", v)}
                min={0}
                max={50000}
                step={500}
                prefix={sym}
                suffix=""
                fx={fx}
              />
              {rawPrices && rawPrices.length > 3 && (
                <SliderField
                  label="투자 시작 시점"
                  value={startIdx}
                  onChange={(v) => setStartIdx(Math.round(v))}
                  min={0}
                  max={maxStartIdx}
                  step={1}
                  prefix=""
                  suffix=""
                  displayValue={startDateLabel}
                  editable={false}
                />
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onLoadPrices}
              disabled={loading}
              className="flex-1 h-11 sm:h-10 rounded-xl bg-gray-100 text-gray-500 text-xs font-semibold hover:bg-gray-200 transition-all active:scale-[0.98]"
            >
              티커 · 기간 변경 후 다시 로드
            </button>
            {hasUnsaved && (
              <button
                onClick={onSave}
                className="h-11 sm:h-10 px-4 rounded-xl border-2 border-[#3182F6] text-[#3182F6] font-semibold text-xs hover:bg-[#E8F3FF] transition-all active:scale-[0.98]"
              >
                저장
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
