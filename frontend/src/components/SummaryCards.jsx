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

function Card({ name, color, summary, strategy, currency, fx }) {
  const isVa = strategy === "va";
  const invested = isVa ? summary.total_invested_va : summary.total_invested_dca;
  const finalVal = isVa ? summary.final_value_va : summary.final_value_dca;
  const returnPct = isVa ? summary.return_pct_va : summary.return_pct_dca;
  const cagr = isVa ? summary.cagr_va : summary.cagr_dca;
  const mdd = summary.mdd ?? 0;
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
        <div>
          <p className="text-[10px] text-gray-400">MDD</p>
          <p className="text-base font-bold tracking-tight text-[#F04452]">
            {mdd}%
          </p>
        </div>
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
    <div className={`grid gap-3 ${items.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
      {items.map((item) => (
        <Card key={item.id} {...item} currency={currency} fx={fx} />
      ))}
    </div>
  );
}
