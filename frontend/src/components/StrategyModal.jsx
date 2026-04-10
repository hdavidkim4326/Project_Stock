import { useEffect, useRef, useState } from "react";

const TABS = [
  { key: "dca", label: "DCA 정액 적립" },
  { key: "va", label: "VA 가치 분할" },
  { key: "compare", label: "비교 분석" },
];

const STRATEGY_DATA = {
  dca: {
    title: "DCA — Dollar Cost Averaging (정액 적립식)",
    color: "#3182F6",
    sections: [
      {
        heading: "핵심 원리",
        body: "매월 동일한 금액을 기계적으로 투자합니다. 주가가 높을 때는 적게, 낮을 때는 많이 매수하게 되어 자연스럽게 평균 매입 단가가 낮아지는 효과(Cost Averaging Effect)를 얻습니다.",
      },
      {
        heading: "적합한 투자자",
        body: "매월 일정 소득이 있는 직장인, 투자 타이밍을 잡기 어려운 초보 투자자, 감정적 판단을 배제하고 싶은 분에게 적합합니다. 특히 변동성이 큰 시장에서 심리적 안정감을 제공합니다.",
      },
      {
        heading: "장점",
        items: [
          "실행이 매우 단순 — 매달 같은 금액을 자동이체하면 끝",
          "마켓 타이밍 불필요 — 하락장도 '싸게 사는 기회'로 전환",
          "감정 개입 최소화 — 규칙 기반 투자로 패닉셀 방지",
          "초보자에게 이상적 — 별도의 시장 분석 없이 실행 가능",
        ],
      },
      {
        heading: "한계",
        items: [
          "일시불(Lump Sum) 투자 대비 강세장에서 수익률이 낮을 수 있음",
          "매입 단가 하락 효과는 기간이 길어질수록 희석",
          "시장 타이밍과 무관하게 투자하므로 비효율 구간 존재",
        ],
      },
      {
        heading: "수학적 공식",
        formula: "매월 투자액 = 고정 금액 M",
        formulaDesc: "n번째 달의 매수 수량 = M ÷ P(n), 여기서 P(n)은 n번째 달의 주가. 총 매수 수량 = Σ(M / P(i)), i=1..n",
      },
      {
        heading: "실제 사례",
        body: "S&P 500에 2010~2020년 매월 $500씩 DCA 투자 시, 총 투자금 $60,000 대비 최종 자산은 약 $102,000으로 +70% 수익률을 기록했습니다. 같은 기간 일시불 투자($60,000)는 +185%를 기록해 DCA보다 높았으나, DCA는 2020년 코로나 폭락 시에도 심리적으로 유지하기 훨씬 쉬웠습니다.",
      },
    ],
    links: [
      { label: "Investopedia — Dollar-Cost Averaging", url: "https://www.investopedia.com/terms/d/dollarcostaveraging.asp" },
      { label: "Vanguard Research — DCA vs. Lump Sum", url: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/dollar-cost-averaging-vs-lump-sum.html" },
      { label: "Marshall (2000) — Analysis of DCA (PDF)", url: "https://valueaveraging.ca/research/Analysis_Dollar_Cost_Averaging.pdf" },
    ],
  },
  va: {
    title: "VA — Value Averaging (가치 분할 매수)",
    color: "#30B780",
    sections: [
      {
        heading: "핵심 원리",
        body: "포트폴리오 가치가 매월 목표 성장 경로(Value Path)를 따르도록 투자 금액을 조절합니다. 목표보다 적으면 더 많이 투자하고, 목표를 초과하면 적게(또는 전혀 하지 않게) 투자합니다. Michael Edleson 교수가 1988년 하버드 비즈니스 리뷰에서 처음 제안했습니다.",
      },
      {
        heading: "적합한 투자자",
        body: "좀 더 적극적인 비용 절감을 원하는 투자자, 매월 투자 금액의 변동을 감당할 수 있는 여유 자금이 있는 분에게 적합합니다. DCA보다 높은 수익률을 기대하면서도 체계적인 규칙을 따르고 싶은 중급 이상 투자자에게 추천됩니다.",
      },
      {
        heading: "장점",
        items: [
          "DCA보다 낮은 평균 매입 단가 — 하락장에서 더 공격적으로 매수",
          "학술 연구에서 DCA 대비 우수한 위험 조정 수익률 입증",
          "Monte Carlo 시뮬레이션상 목표 달성 확률이 DCA보다 높음",
          "하락장에서 '역발상 투자'를 체계적으로 실행",
        ],
      },
      {
        heading: "한계",
        items: [
          "매월 투자 금액이 변동 — 급락장에서 큰 금액이 필요할 수 있음",
          "현금 유동성 관리가 필요 (예비 현금 확보 필수)",
          "DCA에 비해 실행이 다소 복잡 — 매월 계산이 필요",
          "심한 폭락장에서는 감정적으로 큰 금액을 투입하기 어려울 수 있음",
        ],
      },
      {
        heading: "수학적 공식",
        formula: "n번째 달 투자액 = V(n) - V_current",
        formulaDesc: "V(n) = 초기투자 + 월납입 × n (목표 경로), V_current = 현재 포트폴리오 시장가치. 차액이 음수이면 투자하지 않음(또는 매도).",
      },
      {
        heading: "실제 사례",
        body: "Panyagometh(2013) 연구에 따르면, 10년 투자 기간에서 VA는 DCA 대비 Modified Sharpe Ratio가 0.15~0.30 높았고, 목표 자산 도달 확률(Dominance Probability)은 VA가 58~67%로 우세했습니다.",
      },
    ],
    links: [
      { label: "Investopedia — Value Averaging", url: "https://www.investopedia.com/terms/v/value_averaging.asp" },
      { label: "Performance Comparison DCA vs VA (논문)", url: "https://valueaveraging.ca/research/Performance%20Comparison%20DCA_VA.pdf" },
      { label: "Monte Carlo Study — DCA, VA for 401(k)", url: "https://valueaveraging.ca/research/Monte_%20Carlo%20study%20of_DCA_VA_and%20Rebalancing.pdf" },
    ],
  },
};

const COMPARE_ROWS = [
  ["매월 투자 금액", "고정", "변동 (차액 보전)"],
  ["실행 난이도", "매우 쉬움", "보통"],
  ["평균 매입 단가", "낮음", "더 낮음"],
  ["하락장 대응", "일정 금액 투자", "더 공격적 매수"],
  ["현금 관리", "예측 가능", "유동성 관리 필요"],
  ["학술 수익률 비교", "기준 전략", "DCA 대비 우수"],
  ["심리적 부담", "낮음", "중간~높음"],
  ["자동화 용이성", "매우 쉬움", "계산 필요"],
  ["추천 투자 기간", "3년 이상", "5년 이상"],
];

function StrategyPage({ data }) {
  return (
    <div className="space-y-5">
      {data.sections.map((sec, i) => (
        <div key={i}>
          <h4 className="text-sm font-bold text-gray-800 mb-1.5">{sec.heading}</h4>
          {sec.body && <p className="text-[13px] text-gray-600 leading-relaxed">{sec.body}</p>}
          {sec.items && (
            <ul className="space-y-1 mt-1">
              {sec.items.map((item, j) => (
                <li key={j} className="flex gap-2 text-[13px] text-gray-600">
                  <span className="text-gray-300 shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}
          {sec.formula && (
            <div className="mt-2 bg-gray-50 rounded-xl px-4 py-3">
              <code className="text-sm font-mono font-bold text-gray-800 block">{sec.formula}</code>
              <p className="text-[11px] text-gray-500 mt-1">{sec.formulaDesc}</p>
            </div>
          )}
        </div>
      ))}

      <div className="pt-3 border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">참고 자료 & 외부 링크</p>
        <div className="space-y-1.5">
          {data.links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[12px] font-medium hover:underline transition-colors group"
              style={{ color: data.color }}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="shrink-0 opacity-60 group-hover:opacity-100">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
              </svg>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparePage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#F0F7FF] to-[#E8FFF5] rounded-2xl p-5">
        <h4 className="text-sm font-bold text-gray-800 mb-3">DCA vs VA 상세 비교</h4>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-white">
                <th className="text-left px-4 py-2.5 text-gray-400 font-medium">항목</th>
                <th className="text-center px-4 py-2.5 font-bold" style={{ color: "#3182F6" }}>DCA</th>
                <th className="text-center px-4 py-2.5 font-bold" style={{ color: "#30B780" }}>VA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {COMPARE_ROWS.map(([label, dca, va], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-2.5 text-gray-600 font-medium">{label}</td>
                  <td className="px-4 py-2.5 text-center text-gray-700">{dca}</td>
                  <td className="px-4 py-2.5 text-center text-gray-700">{va}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-gray-800 mb-2">어떤 전략을 선택해야 할까?</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border-2 border-[#3182F6]/20 bg-[#F0F7FF] p-4">
            <p className="text-xs font-bold text-[#3182F6] mb-2">DCA를 선택하세요</p>
            <ul className="space-y-1">
              {[
                "매월 투자 금액을 예측 가능하게 유지하고 싶다면",
                "투자를 자동화하고 관리에 시간을 쓰고 싶지 않다면",
                "투자 초보이거나 심리적 안정이 중요하다면",
                "여유 현금이 제한적이라면",
              ].map((t, i) => (
                <li key={i} className="text-[12px] text-gray-600 flex gap-1.5">
                  <span className="text-[#3182F6] shrink-0">→</span>{t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border-2 border-[#30B780]/20 bg-[#E8FFF5] p-4">
            <p className="text-xs font-bold text-[#30B780] mb-2">VA를 선택하세요</p>
            <ul className="space-y-1">
              {[
                "더 낮은 평균 매입 단가를 추구한다면",
                "매월 투자 금액 변동을 감당할 여유가 있다면",
                "시장 하락을 기회로 적극 활용하고 싶다면",
                "중급 이상 투자자로 수학적 전략을 선호한다면",
              ].map((t, i) => (
                <li key={i} className="text-[12px] text-gray-600 flex gap-1.5">
                  <span className="text-[#30B780] shrink-0">→</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-gray-800 mb-2">학술 연구 결론</h4>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <p className="text-[13px] text-gray-600 leading-relaxed">
            <strong>Marshall (2000)</strong> — DCA는 랜덤 투자 대비 통계적으로 유의미한 차이가 없으나, 투자자의 행동 편향(손실 회피)을 완화하는 데 효과적입니다.
          </p>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            <strong>Panyagometh (2013)</strong> — 투자 기간이 길고 목표 수익률이 낮을수록 VA가 DCA를 Modified Sharpe Ratio, Sortino Ratio 기준으로 일관되게 초과 달성합니다.
          </p>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            <strong>Chen & Estes</strong> — 401(k) 시뮬레이션에서 VA는 DCA보다 높은 보상-위험 비율과 목표 달성 확률을 보였으며, 연간 목표 성장률 10-12%가 최적이었습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StrategyModal({ open, onClose }) {
  const overlayRef = useRef(null);
  const [activeTab, setActiveTab] = useState("dca");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, isFullscreen]);

  useEffect(() => {
    if (!open) {
      setActiveTab("dca");
      setIsFullscreen(false);
    }
  }, [open]);

  if (!open) return null;

  const modalClass = isFullscreen
    ? "bg-white w-screen h-screen flex flex-col"
    : "bg-white rounded-3xl shadow-2xl w-[860px] max-h-[88vh] flex flex-col overflow-hidden";

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className={modalClass}>
        {/* Header with tabs */}
        <div className="shrink-0 border-b border-gray-100">
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <div>
              <h2 className="text-lg font-bold text-gray-900">투자 전략 가이드</h2>
              <p className="text-xs text-gray-400 mt-0.5">DCA와 VA의 원리, 장단점, 학술 근거</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                title={isFullscreen ? "축소" : "전체 화면"}
              >
                {isFullscreen ? (
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4H4m0 0l5 5M9 15v5H4m0 0l5-5m6-6V4h5m0 0l-5 5m5 6v5h-5m0 0l5-5" />
                  </svg>
                ) : (
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  </svg>
                )}
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0 px-6 mt-4">
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              const tabColor =
                tab.key === "dca" ? "#3182F6" :
                tab.key === "va" ? "#30B780" : "#6B7280";
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 text-[13px] font-semibold border-b-2 transition-all ${
                    active
                      ? "border-current"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                  style={active ? { color: tabColor, borderColor: tabColor } : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === "dca" && <StrategyPage data={STRATEGY_DATA.dca} />}
          {activeTab === "va" && <StrategyPage data={STRATEGY_DATA.va} />}
          {activeTab === "compare" && <ComparePage />}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[11px] text-gray-400 text-center">
            본 자료는 투자 권유가 아닌 교육 목적의 정보 제공입니다. 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
