# 📈 My Investment Backtester

> **[한국어](#한국어) | [English](#english)**

---

<a id="한국어"></a>

## 🇰🇷 한국어

### 프로젝트 소개

**적립식 투자(DCA)와 가치 분할 매수(VA)** 전략을 과거 데이터로 백테스팅할 수 있는 웹 서비스입니다.

적립식 투자를 하면서 매달 정해진 금액을 넣을지(DCA), 상황에 맞춰 비중을 조절할지(VA) 고민하다가 제 입맛에 딱 맞는 서비스가 없어서 그냥 직접 만들었습니다. 이론적인 계산기가 아니라, 실제 주가 데이터를 긁어와서 내 돈이 어떻게 움직일지 내 눈으로 직접 확인하고 투자하기 위한 용도입니다.

### 개발 배경: 왜 직접 만들었나?

- **🚫 기존 서비스의 한계** — 시중에 있는 계산기들은 내 포트폴리오 비중을 세밀하게 조정하거나, 가치 분할 매수(VA) 같은 특정 전략을 비교하기엔 기능이 부족했습니다.

- **🎯 내 전략에 최적화** — "QLD와 SCHD를 섞으면 어떻게 될까?", "폭락장에 더 넣으면 결과가 바뀔까?" 같은 나만의 궁금증을 내 눈으로 확인하기 위해 직접 팠습니다.

- **⚡ 즉각적인 피드백** — 키보드 입력 없이 슬라이더 조작만으로 수익률과 MDD(최대 낙폭) 변화를 실시간으로 확인하는 쾌적한 인터랙티브 경험이 필요했습니다.

- **🚀 풀스택 아키텍처 구현** — 단순히 계산기 하나를 만드는 것을 넘어, FastAPI와 React를 분리하여 실제 서비스 가능한 수준의 풀스택 웹 환경을 구축하고 배포하는 과정을 경험하고자 했습니다.

### 주요 기능

| 기능 | 설명 |
|------|------|
| **전략 비교** | DCA(정액 적립) vs VA(가치 분할) 백테스팅 |
| **포트폴리오 구성** | 다중 티커 + 비중 설정, 75개+ 주요 자산 검색 지원 |
| **실시간 슬라이더** | 월 적립금, 초기 투자금, 시작 시점을 슬라이더로 즉시 조절 |
| **포트폴리오 저장 & 비교** | 여러 포트폴리오를 저장하고 그래프에서 오버레이 비교 |
| **통화 전환** | USD ↔ KRW 토글, 환율 직접 수정 가능 |
| **핵심 지표** | 최종 자산, 수익률, CAGR, MDD(최대 낙폭) 표시 |
| **차트 확대** | 풀스크린 차트 + 브러시로 기간 선택 |
| **전략 가이드** | DCA/VA 원리, 장단점, 학술 근거를 탭별로 정리한 모달 |

### 스크린샷

```
┌─────────────────────────────────────────────────────────┐
│  Header (통화 토글)                                       │
├──────────────┬──────────────────────────────────────────┤
│  포트폴리오   │                                          │
│  설정         │         📈 자산 성장 추이 차트              │
│              │                                          │
│  투자 전략    │──────────────────────────────────────────│
│  DCA / VA    │                                          │
│              │         📋 요약 카드 (수익률, MDD 등)       │
│  투자 설정    │                                          │
│  (슬라이더)   │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### 기술 스택

#### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.x | UI 프레임워크 |
| Vite | 8.x | 빌드 도구 |
| Tailwind CSS | 4.x | 스타일링 |
| Recharts | 3.x | 차트 시각화 |
| Axios | 1.x | HTTP 클라이언트 |

#### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| FastAPI | 0.115 | API 서버 |
| Python | 3.11+ | 런타임 |
| Pandas | 2.x | 데이터 처리 |
| NumPy | 2.x | 수치 연산 |

#### Deployment
| 서비스 | 대상 |
|--------|------|
| Vercel | 프론트엔드 |
| Render | 백엔드 API |

### 프로젝트 구조

```
Project_Stock/
├── backend/
│   ├── main.py              # FastAPI 앱 (API 엔드포인트, Yahoo Finance 연동)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # 메인 앱 컴포넌트
│   │   ├── components/
│   │   │   ├── Header.jsx         # 헤더 + 통화 토글
│   │   │   ├── PortfolioForm.jsx  # 포트폴리오 구성 폼
│   │   │   ├── BacktestForm.jsx   # 투자 설정 + 전략 선택
│   │   │   ├── ResultChart.jsx    # 자산 성장 차트
│   │   │   ├── SummaryCards.jsx   # 요약 지표 카드
│   │   │   ├── SavedPortfolios.jsx# 저장된 포트폴리오 목록
│   │   │   ├── StrategyModal.jsx  # 전략 설명 모달
│   │   │   └── TickerBrowser.jsx  # 티커 검색/브라우저
│   │   ├── hooks/
│   │   │   └── useBacktestCalc.js # 프론트엔드 DCA/VA 계산 엔진
│   │   └── data/
│   │       └── tickerDb.js        # 75개+ 주요 티커 데이터베이스
│   ├── vercel.json
│   └── .env.example
├── render.yaml
├── start-backend.bat         # Windows 백엔드 실행 스크립트
├── start-frontend.bat        # Windows 프론트엔드 실행 스크립트
└── .gitignore
```

### 아키텍처

```
[사용자 브라우저]
    │
    ├── 1. 가격 데이터 요청 ──→ [FastAPI Backend] ──→ [Yahoo Finance API]
    │                              │
    │                              └── 캐시 (30분 TTL)
    │
    └── 2. 프론트엔드에서 DCA/VA 실시간 계산 (useBacktestCalc)
         └── 슬라이더 변경 시 즉시 재계산 (서버 호출 없음)
```

### 로컬 실행

```bash
# 1. 백엔드
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8003

# 2. 프론트엔드
cd frontend
npm install
npm run dev
```

또는 Windows에서 `start-backend.bat`, `start-frontend.bat` 더블클릭으로 실행할 수 있습니다.

### 환경 변수

| 변수 | 위치 | 설명 |
|------|------|------|
| `VITE_API_BASE` | 프론트엔드 | 백엔드 API URL (기본: `http://localhost:8003`) |
| `CORS_ORIGINS` | 백엔드 | 허용할 프론트엔드 도메인 (기본: `*`) |

---

<a id="english"></a>

## 🇺🇸 English

### About

A web service for backtesting **Dollar-Cost Averaging (DCA)** and **Value Averaging (VA)** investment strategies using real historical stock data.

When I started investing, I kept asking myself: "Should I invest the same amount every month, or adjust based on market conditions?" Theory alone wasn't enough — I wanted to **compare and visualize** both strategies with actual price data.

### Why I Built This

- 📊 **Data-driven decisions** — Compare strategies with numbers, not gut feelings
- 🔄 **Real-time simulation** — Instantly see results change as you adjust weights, amounts, and start dates with interactive sliders
- 📚 **Learning project** — Practice full-stack development (React + FastAPI) and financial data processing simultaneously

### Key Features

| Feature | Description |
|---------|-------------|
| **Strategy Comparison** | DCA vs VA backtesting side by side |
| **Portfolio Builder** | Multi-ticker with weight allocation, 75+ searchable assets |
| **Real-time Sliders** | Instantly adjust monthly investment, initial capital, and start date |
| **Save & Compare** | Save multiple portfolios and overlay them on a single chart |
| **Currency Toggle** | USD ↔ KRW with editable exchange rate |
| **Key Metrics** | Final value, return %, CAGR, MDD (Maximum Drawdown) |
| **Chart Zoom** | Full-screen chart with brush for period selection |
| **Strategy Guide** | Tabbed modal explaining DCA/VA principles with academic references |

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header (Currency Toggle)                                │
├──────────────┬──────────────────────────────────────────┤
│  Portfolio   │                                          │
│  Setup       │         📈 Asset Growth Chart              │
│              │                                          │
│  Strategy    │──────────────────────────────────────────│
│  DCA / VA    │                                          │
│              │         📋 Summary Cards (Return, MDD)     │
│  Investment  │                                          │
│  (Sliders)   │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### Tech Stack

#### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| Vite | 8.x | Build tool |
| Tailwind CSS | 4.x | Styling |
| Recharts | 3.x | Chart visualization |
| Axios | 1.x | HTTP client |

#### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.115 | API server |
| Python | 3.11+ | Runtime |
| Pandas | 2.x | Data processing |
| NumPy | 2.x | Numerical computation |

#### Deployment
| Service | Target |
|---------|--------|
| Vercel | Frontend |
| Render | Backend API |

### Project Structure

```
Project_Stock/
├── backend/
│   ├── main.py              # FastAPI app (endpoints, Yahoo Finance integration)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main app component
│   │   ├── components/
│   │   │   ├── Header.jsx         # Header + currency toggle
│   │   │   ├── PortfolioForm.jsx  # Portfolio composition form
│   │   │   ├── BacktestForm.jsx   # Investment settings + strategy selection
│   │   │   ├── ResultChart.jsx    # Asset growth chart
│   │   │   ├── SummaryCards.jsx   # Summary metrics cards
│   │   │   ├── SavedPortfolios.jsx# Saved portfolio list
│   │   │   ├── StrategyModal.jsx  # Strategy explanation modal
│   │   │   └── TickerBrowser.jsx  # Ticker search/browser
│   │   ├── hooks/
│   │   │   └── useBacktestCalc.js # Client-side DCA/VA calculation engine
│   │   └── data/
│   │       └── tickerDb.js        # 75+ curated ticker database
│   ├── vercel.json
│   └── .env.example
├── render.yaml
├── start-backend.bat         # Windows backend launcher
├── start-frontend.bat        # Windows frontend launcher
└── .gitignore
```

### Architecture

```
[User Browser]
    │
    ├── 1. Request price data ──→ [FastAPI Backend] ──→ [Yahoo Finance API]
    │                                │
    │                                └── In-memory cache (30-min TTL)
    │
    └── 2. Client-side DCA/VA calculation (useBacktestCalc)
         └── Instant recalculation on slider change (no server call)
```

### Getting Started

```bash
# 1. Backend
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8003

# 2. Frontend
cd frontend
npm install
npm run dev
```

On Windows, you can also double-click `start-backend.bat` and `start-frontend.bat`.

### Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `VITE_API_BASE` | Frontend | Backend API URL (default: `http://localhost:8003`) |
| `CORS_ORIGINS` | Backend | Allowed frontend domains (default: `*`) |

---

## License

MIT
