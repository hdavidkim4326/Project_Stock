import { useState } from "react";

function fmtMoney(value, currency, fx) {
  const v = value * fx;
  if (currency === "KRW") {
    return v.toLocaleString("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function monthDiff(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

function MddCell({ mdd, mddDetail, currency, fx }) {
  const [hover, setHover] = useState(false);
  const d = mddDetail;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <p className="text-[10px] text-gray-400">MDD</p>
      <p className="text-base font-bold tracking-tight text-[#F04452] cursor-default inline-flex items-center gap-1">
        {mdd}%
        {d && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-300">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 16v-4m0-4h.01" />
          </svg>
        )}
      </p>

      {hover && d && (
        <div className="absolute z-20 top-full left-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-3 pointer-events-none">
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F04452" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            <span className="text-[11px] font-bold text-gray-700">최대 낙폭 상세</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-gray-400">고점</span>
              <span className="font-semibold text-gray-700">
                {d.peakDate.slice(0, 7)} · {fmtMoney(d.peakValue, currency, fx)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">저점</span>
              <span className="font-semibold text-[#F04452]">
                {d.troughDate.slice(0, 7)} · {fmtMoney(d.troughValue, currency, fx)}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-1.5 flex justify-between">
              <span className="text-gray-400">하락 기간</span>
              <span className="font-semibold text-gray-700">
                {monthDiff(d.peakDate, d.troughDate)}개월
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ name, color, summary, strategy, currency, fx }) {
  const isVa = strategy === "va";
  const invested = isVa ? summary.total_invested_va : summary.total_invested_dca;
  const finalVal = isVa ? summary.final_value_va : summary.final_value_dca;
  const returnPct = isVa ? summary.return_pct_va : summary.return_pct_dca;
  const cagr = isVa ? summary.cagr_va : summary.cagr_dca;
  const mdd = summary.mdd ?? 0;
  const mddDetail = summary.mddDetail ?? null;
  const positive = returnPct >= 0;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100" style={{ borderColor: color + "40" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <p className="text-xs font-medium text-gray-500 truncate">{name}</p>
      </div>
      <div className="grid grid-cols-3 gap-x-3 gap-y-2">
        <div>
          <p className="text-[10px] text-gray-400">최종 자산</p>
          <p className="text-base font-bold tracking-tight" style={{ color }}>
            {fmtMoney(finalVal, currency, fx)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400">총 수익률</p>
          <p className={`text-base font-bold tracking-tight ${positive ? "text-[#30B780]" : "text-[#F04452]"}`}>
            {positive ? "+" : ""}{returnPct}%
          </p>
        </div>
        <MddCell mdd={mdd} mddDetail={mddDetail} currency={currency} fx={fx} />
        <div>
          <p className="text-[10px] text-gray-400">투자 원금</p>
          <p className="text-sm font-semibold text-gray-600">{fmtMoney(invested, currency, fx)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400">CAGR</p>
          <p className="text-sm font-semibold text-gray-600">{cagr}%</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400">기간</p>
          <p className="text-sm font-semibold text-gray-600">{summary.months}개월</p>
        </div>
      </div>
    </div>
  );
}

export default function SummaryCards({ savedPortfolios, unsavedResult, fx = 1, currency = "USD" }) {
  const items = [];

  savedPortfolios.forEach((p) => {
    items.push({
      id: `saved_${p.id}`,
      name: p.name,
      color: p.color,
      strategy: p.strategy,
      summary: p.result.summary,
    });
  });

  if (unsavedResult) {
    items.push({
      id: "unsaved",
      name: unsavedResult.name || "현재 결과",
      color: unsavedResult.color || "#3182F6",
      strategy: unsavedResult.strategy,
      summary: unsavedResult.result.summary,
    });
  }

  if (!items.length) return null;

  return (
    <div className={`grid gap-3 ${items.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
      {items.map((item) => (
        <Card key={item.id} {...item} currency={currency} fx={fx} />
      ))}
    </div>
  );
}
