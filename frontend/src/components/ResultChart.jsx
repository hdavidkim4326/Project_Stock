import { useMemo, useState } from "react";
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

function CustomTooltip({ active, payload, label, fmtFn }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-gray-100 min-w-[180px]">
      <p className="text-[11px] text-gray-400 font-medium mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex justify-between items-center mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[11px] text-gray-500 max-w-[120px] truncate">{entry.name}</span>
          </div>
          <span className="text-xs font-bold text-gray-800 ml-3">{fmtFn(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

function getValueKey(strategy) {
  return strategy === "va" ? "portfolio_value_va" : "portfolio_value_dca";
}

function ChartContent({ mergedData, valueKeys, showInvested, height, showBrush, fmtFn }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
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
          <Tooltip content={<CustomTooltip fmtFn={fmtFn} />} />
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
      </ResponsiveContainer>
    </div>
  );
}

function ExpandedModal({ onClose, mergedData, valueKeys, showInvested, datasets, fmtFn }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-none sm:rounded-3xl shadow-2xl w-full h-full sm:w-[95vw] sm:h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-900">자산 성장 추이 — 확대 보기</h2>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
              하단 브러시를 드래그해서 기간을 선택하세요
              {datasets.length > 1 ? ` · ${datasets.length}개 포트폴리오 비교` : ""}
            </p>
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
        <div className="flex-1 p-3 sm:p-6">
          <ChartContent
            mergedData={mergedData}
            valueKeys={valueKeys}
            showInvested={showInvested}
            height="100%"
            showBrush={true}
            fmtFn={fmtFn}
          />
        </div>
      </div>
    </div>
  );
}

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

    const merged = allDates.map((date) => {
      const point = { date };
      datasets.forEach((ds) => {
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
          });
        }
        if (rec) {
          point[vk] = rec[getValueKey(ds.strategy)];
          point[ik] = rec.invested;
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
        <ChartContent
          mergedData={mergedData}
          valueKeys={valueKeys}
          showInvested={showInvested}
          height={240}
          showBrush={false}
          fmtFn={fmtFn}
        />
      </div>

      {expanded && (
        <ExpandedModal
          onClose={() => setExpanded(false)}
          mergedData={mergedData}
          valueKeys={valueKeys}
          showInvested={showInvested}
          datasets={datasets}
          fmtFn={fmtFn}
        />
      )}
    </>
  );
}
