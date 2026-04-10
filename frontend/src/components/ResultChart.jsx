import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Brush,
} from "recharts";
import SummaryCards from "./SummaryCards";

function makeFmtCurrency(currency, fx) {
  return (value) => {
    const v = value * fx;
    if (currency === "KRW") {
      if (v >= 1_000_000_000) return `₩${(v / 1_000_000_000).toFixed(1)}B`;
      if (v >= 100_000_000) return `₩${(v / 100_000_000).toFixed(1)}억`;
      if (v >= 10_000) return `₩${(v / 10_000).toFixed(0)}만`;
      return `₩${Math.round(v).toLocaleString()}`;
    }
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    return `$${v.toFixed(0)}`;
  };
}

function CustomTooltip({ active, payload, label, fmtFn, valueKeys }) {
  if (!active || !payload?.length) return null;
  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  const valueEntries = payload.filter((e) => e.dataKey?.startsWith("value_"));

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-gray-100 min-w-[200px]">
      <p className="text-[11px] text-gray-400 font-medium mb-2">{label}</p>
      {valueEntries.map((entry) => {
        const keyInfo = valueKeys?.find((k) => k.valueKey === entry.dataKey);
        const invested = keyInfo ? dataPoint[keyInfo.investedKey] : 0;
        const monthlyInvest = keyInfo ? dataPoint[`monthlyInvest_${keyInfo.id}`] : null;
        const isVa = keyInfo?.strategy === "va";
        const returnPct = invested > 0
          ? ((entry.value - invested) / invested * 100).toFixed(1)
          : "0.0";
        const positive = parseFloat(returnPct) >= 0;
        const monthIdx = keyInfo ? dataPoint[`monthIdx_${keyInfo.id}`] : 0;
        const years = monthIdx / 12;
        const cagr = invested > 0 && entry.value > 0 && years >= 1
          ? ((entry.value / invested) ** (1 / years) - 1) * 100
          : null;

        return (
          <div key={entry.dataKey} className="mb-2.5 last:mb-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[11px] text-gray-500 max-w-[120px] truncate">{entry.name}</span>
              </div>
              <span className="text-xs font-bold text-gray-800 ml-3">{fmtFn(entry.value)}</span>
            </div>
            <div className="ml-3.5 mt-0.5 flex items-center gap-2 text-[10px]">
              <span className={`font-semibold ${positive ? "text-[#30B780]" : "text-[#F04452]"}`}>
                {positive ? "+" : ""}{returnPct}%
              </span>
              {cagr !== null && (
                <span className="text-gray-400">
                  CAGR {cagr >= 0 ? "+" : ""}{cagr.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="ml-3.5 mt-0.5 flex items-center gap-2 text-[10px] text-gray-400">
              <span>원금 {fmtFn(invested)}</span>
              {isVa && monthlyInvest != null && (
                <span>· 이번 달 {fmtFn(monthlyInvest)}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getValueKey(strategy) {
  return strategy === "va" ? "portfolio_value_va" : "portfolio_value_dca";
}

function ChartCore({ mergedData, valueKeys, showInvested, fmtFn, showBrush = false }) {
  return (
    <AreaChart data={mergedData} margin={{ top: 5, right: 10, left: 0, bottom: showBrush ? 5 : 0 }}>
      <defs>
        {valueKeys.map((k) => (
          <linearGradient key={k.id} id={`grad_${k.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={k.color} stopOpacity={0.12} />
            <stop offset="100%" stopColor={k.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      <XAxis
        dataKey="date"
        tickLine={false}
        axisLine={false}
        tick={{ fontSize: 10, fill: "#9CA3AF" }}
        tickFormatter={(v) => v.slice(0, 7)}
        interval="preserveStartEnd"
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        tick={{ fontSize: 10, fill: "#9CA3AF" }}
        tickFormatter={fmtFn}
        width={65}
      />
      <Tooltip content={<CustomTooltip fmtFn={fmtFn} valueKeys={valueKeys} />} />
      <Legend
        verticalAlign="top"
        align="right"
        iconType="circle"
        iconSize={7}
        wrapperStyle={{ fontSize: 11, color: "#6B7280", paddingBottom: 8 }}
      />

      {showInvested && valueKeys[0] && (
        <Area
          type="monotone"
          dataKey={valueKeys[0].investedKey}
          name="투자 원금"
          stroke="#D1D5DB"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          fill="none"
          dot={false}
          activeDot={false}
        />
      )}

      {valueKeys.map((k) => (
        <Area
          key={k.id}
          type="monotone"
          dataKey={k.valueKey}
          name={k.name}
          stroke={k.color}
          strokeWidth={2.5}
          strokeDasharray={k.dashed ? "8 4" : undefined}
          fill={`url(#grad_${k.id})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, fill: "white" }}
        />
      ))}

      {showBrush && mergedData.length > 6 && (
        <Brush
          dataKey="date"
          height={28}
          stroke="#3182F6"
          fill="#F9FAFB"
          tickFormatter={(v) => v.slice(0, 7)}
          travellerWidth={8}
        />
      )}
    </AreaChart>
  );
}

/* ── Zoom presets ─────────────────────────────────────────────────────────── */

const ZOOM_OPTIONS = [
  { key: "all", label: "전체" },
  { key: "10y", label: "10Y", months: 120 },
  { key: "5y", label: "5Y", months: 60 },
  { key: "3y", label: "3Y", months: 36 },
  { key: "1y", label: "1Y", months: 12 },
];

/* ── Expanded Modal ───────────────────────────────────────────────────────── */

function ExpandedModal({
  onClose,
  mergedData,
  valueKeys,
  showInvested,
  datasets,
  fmtFn,
  savedPortfolios,
  unsavedResult,
  fx,
  currency,
}) {
  const [zoom, setZoom] = useState("all");
  const scrollRef = useRef(null);

  const total = mergedData.length;
  const selected = ZOOM_OPTIONS.find((z) => z.key === zoom);
  const visibleMonths = selected?.months;
  const isZoomed = zoom !== "all" && visibleMonths && total > visibleMonths;
  const widthPct = isZoomed ? `${(total / visibleMonths) * 100}%` : "100%";

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isZoomed) {
      requestAnimationFrame(() => {
        el.scrollLeft = el.scrollWidth;
      });
    } else {
      el.scrollLeft = 0;
    }
  }, [zoom, isZoomed]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isZoomed) return;
    const handler = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [isZoomed]);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-none sm:rounded-3xl shadow-2xl w-full h-full sm:w-[95vw] sm:h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-900">
              자산 성장 추이 — 확대 보기
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
                {ZOOM_OPTIONS.map((z) => {
                  const tooWide = z.months && z.months >= total;
                  return (
                    <button
                      key={z.key}
                      onClick={() => !tooWide && setZoom(z.key)}
                      disabled={tooWide}
                      className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        zoom === z.key
                          ? "bg-white text-gray-800 shadow-sm"
                          : tooWide
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {z.label}
                    </button>
                  );
                })}
              </div>
              {isZoomed && (
                <span className="text-[10px] text-gray-400 hidden sm:inline">
                  ← 스크롤하여 기간 이동
                </span>
              )}
              {!isZoomed && (
                <span className="text-[10px] text-gray-400 hidden sm:inline">
                  하단 브러시로 기간 선택{datasets.length > 1 ? ` · ${datasets.length}개 비교` : ""}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0 ml-3"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chart with horizontal scroll */}
        <div className="flex-1 min-h-0 px-3 sm:px-6 pt-3 pb-1">
          <div
            ref={scrollRef}
            className="h-full overflow-x-auto overscroll-x-contain"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#D1D5DB transparent" }}
          >
            <div style={{ width: widthPct, height: "100%", minWidth: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <ChartCore
                  mergedData={mergedData}
                  valueKeys={valueKeys}
                  showInvested={showInvested}
                  fmtFn={fmtFn}
                  showBrush={!isZoomed}
                />
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="shrink-0 border-t border-gray-100 px-4 sm:px-6 py-3 overflow-y-auto max-h-[220px]">
          <SummaryCards
            savedPortfolios={savedPortfolios}
            unsavedResult={unsavedResult}
            fx={fx}
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Main chart (inline) ──────────────────────────────────────────────────── */

export default function ResultChart({ savedPortfolios, unsavedResult, fx = 1, currency = "USD" }) {
  const [expanded, setExpanded] = useState(false);

  const fmtFn = useMemo(() => makeFmtCurrency(currency, fx), [currency, fx]);

  const datasets = useMemo(() => {
    const list = [];
    savedPortfolios.forEach((p) => {
      list.push({
        id: `saved_${p.id}`,
        name: p.name,
        color: p.color,
        strategy: p.strategy,
        records: p.result.monthly_records,
        dashed: false,
      });
    });
    if (unsavedResult) {
      list.push({
        id: "unsaved",
        name: unsavedResult.name || "현재 결과",
        color: unsavedResult.color || "#3182F6",
        strategy: unsavedResult.strategy,
        records: unsavedResult.result.monthly_records,
        dashed: list.length > 0,
      });
    }
    return list;
  }, [savedPortfolios, unsavedResult]);

  const { mergedData, valueKeys } = useMemo(() => {
    const allDatesSet = new Set();
    datasets.forEach((ds) => ds.records.forEach((r) => allDatesSet.add(r.date)));
    const allDates = [...allDatesSet].sort();
    const vKeys = [];

    const dsDateIdx = datasets.map((ds) => {
      const map = new Map();
      ds.records.forEach((r, i) => map.set(r.date, i));
      return map;
    });

    const merged = allDates.map((date) => {
      const point = { date };
      datasets.forEach((ds, dsIdx) => {
        const rec = ds.records.find((r) => r.date === date);
        const vk = `value_${ds.id}`;
        const ik = `invested_${ds.id}`;
        if (!vKeys.find((k) => k.id === ds.id)) {
          vKeys.push({
            id: ds.id,
            valueKey: vk,
            investedKey: ik,
            name: ds.name,
            color: ds.color,
            dashed: ds.dashed,
            strategy: ds.strategy,
          });
        }
        if (rec) {
          point[vk] = rec[getValueKey(ds.strategy)];
          point[ik] = rec.invested;
          point[`monthlyInvest_${ds.id}`] = rec.monthlyInvest ?? null;
          point[`monthIdx_${ds.id}`] = (dsDateIdx[dsIdx].get(date) ?? 0) + 1;
        }
      });
      return point;
    });

    return { mergedData: merged, valueKeys: vKeys };
  }, [datasets]);

  if (!datasets.length) return null;

  const showInvested = datasets.length === 1;

  return (
    <>
      <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-900">자산 성장 추이</h2>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
              {datasets.length > 1
                ? `${datasets.length}개 포트폴리오 비교`
                : datasets[0]?.name}
            </p>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-[#3182F6] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[#E8F3FF]"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            <span className="hidden sm:inline">확대 보기</span>
          </button>
        </div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartCore
              mergedData={mergedData}
              valueKeys={valueKeys}
              showInvested={showInvested}
              fmtFn={fmtFn}
            />
          </ResponsiveContainer>
        </div>
      </div>

      {expanded && (
        <ExpandedModal
          onClose={() => setExpanded(false)}
          mergedData={mergedData}
          valueKeys={valueKeys}
          showInvested={showInvested}
          datasets={datasets}
          fmtFn={fmtFn}
          savedPortfolios={savedPortfolios}
          unsavedResult={unsavedResult}
          fx={fx}
          currency={currency}
        />
      )}
    </>
  );
}
