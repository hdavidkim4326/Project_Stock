const TICKER_DB = [
  // ── 미국 대표 ETF ──
  { ticker: "SPY",  name: "S&P 500 ETF",           nameKr: "S&P 500 추종",      category: "us_etf", tags: ["대형주", "지수"] },
  { ticker: "VOO",  name: "Vanguard S&P 500",      nameKr: "뱅가드 S&P 500",    category: "us_etf", tags: ["대형주", "지수"] },
  { ticker: "VTI",  name: "Total Stock Market",     nameKr: "미국 전체 시장",     category: "us_etf", tags: ["전체시장"] },
  { ticker: "QQQ",  name: "Nasdaq-100 ETF",         nameKr: "나스닥 100",         category: "us_etf", tags: ["기술주", "나스닥"] },
  { ticker: "IVV",  name: "iShares Core S&P 500",   nameKr: "아이셰어즈 S&P 500", category: "us_etf", tags: ["대형주", "지수"] },
  { ticker: "DIA",  name: "Dow Jones ETF",           nameKr: "다우존스 추종",      category: "us_etf", tags: ["대형주", "다우"] },
  { ticker: "IWM",  name: "Russell 2000 ETF",        nameKr: "러셀 2000 소형주",   category: "us_etf", tags: ["소형주"] },
  { ticker: "VEA",  name: "Developed Markets ETF",   nameKr: "선진국 시장",        category: "us_etf", tags: ["국제"] },
  { ticker: "VWO",  name: "Emerging Markets ETF",    nameKr: "신흥국 시장",        category: "us_etf", tags: ["국제", "신흥국"] },
  { ticker: "ARKK", name: "ARK Innovation ETF",      nameKr: "ARK 혁신 기술",     category: "us_etf", tags: ["혁신", "기술주"] },

  // ── 배당 ETF ──
  { ticker: "SCHD", name: "Schwab US Dividend",      nameKr: "슈왑 미국 배당",     category: "us_etf", tags: ["배당", "가치"] },
  { ticker: "VYM",  name: "Vanguard High Dividend",  nameKr: "뱅가드 고배당",      category: "us_etf", tags: ["배당"] },
  { ticker: "HDV",  name: "iShares High Dividend",   nameKr: "아이셰어즈 고배당",  category: "us_etf", tags: ["배당"] },
  { ticker: "DVY",  name: "iShares Select Dividend",  nameKr: "아이셰어즈 배당 셀렉트", category: "us_etf", tags: ["배당"] },
  { ticker: "DGRO", name: "iShares Dividend Growth",  nameKr: "배당 성장 ETF",      category: "us_etf", tags: ["배당", "성장"] },
  { ticker: "JEPI", name: "JPMorgan Equity Premium",  nameKr: "JP모건 프리미엄 인컴", category: "us_etf", tags: ["배당", "커버드콜"] },
  { ticker: "JEPQ", name: "JPMorgan Nasdaq Premium",  nameKr: "JP모건 나스닥 프리미엄", category: "us_etf", tags: ["배당", "나스닥"] },

  // ── 레버리지 / 인버스 ──
  { ticker: "QLD",  name: "ProShares Ultra QQQ",     nameKr: "나스닥 2배 레버리지",  category: "leverage", tags: ["레버리지", "나스닥"] },
  { ticker: "TQQQ", name: "ProShares UltraPro QQQ",  nameKr: "나스닥 3배 레버리지",  category: "leverage", tags: ["레버리지", "나스닥"] },
  { ticker: "SSO",  name: "ProShares Ultra S&P 500", nameKr: "S&P 500 2배",         category: "leverage", tags: ["레버리지", "S&P"] },
  { ticker: "UPRO", name: "ProShares UltraPro S&P",  nameKr: "S&P 500 3배",         category: "leverage", tags: ["레버리지", "S&P"] },
  { ticker: "SOXL", name: "Direxion Semi Bull 3x",   nameKr: "반도체 3배 레버리지",  category: "leverage", tags: ["레버리지", "반도체"] },
  { ticker: "SQQQ", name: "ProShares UltraPro Short QQQ", nameKr: "나스닥 3배 인버스", category: "leverage", tags: ["인버스", "나스닥"] },
  { ticker: "SH",   name: "ProShares Short S&P 500",  nameKr: "S&P 500 인버스",     category: "leverage", tags: ["인버스", "S&P"] },
  { ticker: "SPXS", name: "Direxion S&P 500 Bear 3x", nameKr: "S&P 500 3배 인버스", category: "leverage", tags: ["인버스", "S&P"] },
  { ticker: "FNGU", name: "MicroSectors FANG+ Bull 3x", nameKr: "FANG+ 3배 레버리지", category: "leverage", tags: ["레버리지", "빅테크"] },
  { ticker: "TMF",  name: "Direxion Treasury Bull 3x",  nameKr: "미국채 20년 3배",    category: "leverage", tags: ["레버리지", "채권"] },

  // ── 미국 개별주 ──
  { ticker: "AAPL", name: "Apple",                    nameKr: "애플",               category: "us_stock", tags: ["빅테크", "하드웨어"] },
  { ticker: "MSFT", name: "Microsoft",                nameKr: "마이크로소프트",      category: "us_stock", tags: ["빅테크", "소프트웨어"] },
  { ticker: "GOOGL",name: "Alphabet (Google)",        nameKr: "구글 (알파벳)",       category: "us_stock", tags: ["빅테크", "광고"] },
  { ticker: "AMZN", name: "Amazon",                   nameKr: "아마존",             category: "us_stock", tags: ["빅테크", "이커머스"] },
  { ticker: "NVDA", name: "NVIDIA",                   nameKr: "엔비디아",           category: "us_stock", tags: ["반도체", "AI"] },
  { ticker: "META", name: "Meta Platforms",            nameKr: "메타 (페이스북)",    category: "us_stock", tags: ["빅테크", "SNS"] },
  { ticker: "TSLA", name: "Tesla",                    nameKr: "테슬라",             category: "us_stock", tags: ["전기차", "에너지"] },
  { ticker: "AMD",  name: "Advanced Micro Devices",   nameKr: "AMD",               category: "us_stock", tags: ["반도체"] },
  { ticker: "AVGO", name: "Broadcom",                 nameKr: "브로드컴",           category: "us_stock", tags: ["반도체"] },
  { ticker: "CRM",  name: "Salesforce",               nameKr: "세일즈포스",         category: "us_stock", tags: ["소프트웨어", "클라우드"] },
  { ticker: "NFLX", name: "Netflix",                  nameKr: "넷플릭스",           category: "us_stock", tags: ["미디어", "스트리밍"] },
  { ticker: "COST", name: "Costco",                   nameKr: "코스트코",           category: "us_stock", tags: ["리테일", "소비재"] },
  { ticker: "JPM",  name: "JPMorgan Chase",           nameKr: "JP모건",             category: "us_stock", tags: ["금융", "은행"] },
  { ticker: "V",    name: "Visa",                     nameKr: "비자",               category: "us_stock", tags: ["금융", "결제"] },
  { ticker: "UNH",  name: "UnitedHealth Group",       nameKr: "유나이티드헬스",      category: "us_stock", tags: ["헬스케어"] },
  { ticker: "JNJ",  name: "Johnson & Johnson",        nameKr: "존슨앤존슨",         category: "us_stock", tags: ["헬스케어", "배당"] },
  { ticker: "WMT",  name: "Walmart",                  nameKr: "월마트",             category: "us_stock", tags: ["리테일", "배당"] },
  { ticker: "KO",   name: "Coca-Cola",                nameKr: "코카콜라",           category: "us_stock", tags: ["소비재", "배당킹"] },
  { ticker: "PG",   name: "Procter & Gamble",         nameKr: "P&G",               category: "us_stock", tags: ["소비재", "배당킹"] },
  { ticker: "DIS",  name: "Walt Disney",              nameKr: "디즈니",             category: "us_stock", tags: ["미디어", "엔터"] },
  { ticker: "PLTR", name: "Palantir Technologies",    nameKr: "팔란티어",           category: "us_stock", tags: ["소프트웨어", "AI", "빅데이터"] },
  { ticker: "COIN", name: "Coinbase Global",          nameKr: "코인베이스",         category: "us_stock", tags: ["크립토", "거래소"] },
  { ticker: "SOFI", name: "SoFi Technologies",        nameKr: "소파이",             category: "us_stock", tags: ["핀테크"] },

  // ── 채권 / 원자재 / 리츠 ──
  { ticker: "TLT",  name: "iShares 20+ Year Treasury", nameKr: "미국 장기국채 20년+", category: "bond_commodity", tags: ["채권", "장기"] },
  { ticker: "IEF",  name: "iShares 7-10 Year Treasury",nameKr: "미국 중기국채 7-10년", category: "bond_commodity", tags: ["채권", "중기"] },
  { ticker: "SHY",  name: "iShares 1-3 Year Treasury", nameKr: "미국 단기국채 1-3년",  category: "bond_commodity", tags: ["채권", "단기"] },
  { ticker: "BND",  name: "Vanguard Total Bond",       nameKr: "뱅가드 종합 채권",     category: "bond_commodity", tags: ["채권"] },
  { ticker: "LQD",  name: "iShares Investment Grade",  nameKr: "투자등급 회사채",      category: "bond_commodity", tags: ["채권", "회사채"] },
  { ticker: "HYG",  name: "iShares High Yield Corp",   nameKr: "하이일드 회사채",      category: "bond_commodity", tags: ["채권", "하이일드"] },
  { ticker: "GLD",  name: "SPDR Gold Shares",          nameKr: "금 ETF",              category: "bond_commodity", tags: ["금", "원자재"] },
  { ticker: "SLV",  name: "iShares Silver Trust",      nameKr: "은 ETF",              category: "bond_commodity", tags: ["은", "원자재"] },
  { ticker: "USO",  name: "United States Oil Fund",    nameKr: "원유 ETF",            category: "bond_commodity", tags: ["원유", "원자재"] },
  { ticker: "VNQ",  name: "Vanguard Real Estate",      nameKr: "뱅가드 리츠",         category: "bond_commodity", tags: ["부동산", "리츠"] },
  { ticker: "VNQI", name: "Vanguard Global ex-US RE",  nameKr: "글로벌 리츠 (미국 외)", category: "bond_commodity", tags: ["부동산", "리츠", "국제"] },

  // ── 한국 ETF (KRX) ──
  { ticker: "069500.KS", name: "KODEX 200",            nameKr: "코덱스 200",          category: "kr_etf", tags: ["코스피", "지수"] },
  { ticker: "229200.KS", name: "KODEX KOSDAQ 150",     nameKr: "코덱스 코스닥 150",   category: "kr_etf", tags: ["코스닥", "지수"] },
  { ticker: "305720.KS", name: "KODEX 2차전지산업",     nameKr: "코덱스 2차전지",      category: "kr_etf", tags: ["2차전지", "테마"] },
  { ticker: "091160.KS", name: "KODEX 반도체",          nameKr: "코덱스 반도체",        category: "kr_etf", tags: ["반도체", "테마"] },
  { ticker: "266370.KS", name: "KODEX 미국S&P500TR",    nameKr: "코덱스 미국 S&P 500", category: "kr_etf", tags: ["미국", "S&P"] },
  { ticker: "379810.KS", name: "KODEX 미국나스닥100TR",  nameKr: "코덱스 미국 나스닥",   category: "kr_etf", tags: ["미국", "나스닥"] },
  { ticker: "371460.KS", name: "TIGER 차이나전기차",     nameKr: "타이거 차이나 전기차",  category: "kr_etf", tags: ["중국", "전기차"] },
  { ticker: "381180.KS", name: "TIGER 미국테크TOP10",   nameKr: "타이거 미국 테크 10",   category: "kr_etf", tags: ["미국", "빅테크"] },
  { ticker: "360750.KS", name: "TIGER 미국S&P500",      nameKr: "타이거 미국 S&P 500",  category: "kr_etf", tags: ["미국", "S&P"] },
  { ticker: "133690.KS", name: "TIGER 미국나스닥100",    nameKr: "타이거 미국 나스닥",    category: "kr_etf", tags: ["미국", "나스닥"] },
  { ticker: "329750.KS", name: "TIGER 미국배당다우존스", nameKr: "타이거 미국 배당",      category: "kr_etf", tags: ["미국", "배당"] },
  { ticker: "102110.KS", name: "TIGER 200",             nameKr: "타이거 200",           category: "kr_etf", tags: ["코스피", "지수"] },
  { ticker: "114800.KS", name: "KODEX 인버스",          nameKr: "코덱스 인버스",        category: "kr_etf", tags: ["인버스", "코스피"] },
  { ticker: "122630.KS", name: "KODEX 레버리지",        nameKr: "코덱스 레버리지",      category: "kr_etf", tags: ["레버리지", "코스피"] },
];

export const CATEGORIES = [
  { key: "all",            label: "전체" },
  { key: "us_etf",         label: "미국 ETF" },
  { key: "us_stock",       label: "미국 개별주" },
  { key: "leverage",       label: "레버리지/인버스" },
  { key: "bond_commodity", label: "채권/원자재/리츠" },
  { key: "kr_etf",         label: "한국 ETF" },
];

export function searchTickers(query, category = "all") {
  const q = query.toLowerCase().trim();
  let filtered = TICKER_DB;

  if (category !== "all") {
    filtered = filtered.filter((t) => t.category === category);
  }

  if (!q) return filtered;

  return filtered.filter((t) =>
    t.ticker.toLowerCase().includes(q) ||
    t.name.toLowerCase().includes(q) ||
    t.nameKr.includes(q) ||
    t.tags.some((tag) => tag.includes(q))
  );
}

export default TICKER_DB;
