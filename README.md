# Assumption Check AI 🧠⚡
> **"Don't just assume. Analyze, verify, and decide."**

An intelligent, full-stack decision-analysis and critical-thinking platform engineered to evaluate assumptions, verify empirical claims, dissect logical fallacies, and estimate decision risks before committing irreversible resources.

Built with **FastAPI (Python 3.12)**, **React 18 + TypeScript + Vite**, **Tailwind CSS**, and **SQLAlchemy (SQLite / PostgreSQL)**.

---

## 🌟 Key Capabilities

- 🔍 **Axiomatic Assumption Extraction**: Uncovers both explicit premises and subtle, hidden cognitive leaps.
- ⚖️ **Five Calibrated Epistemic Verdicts**:
  - `SUPPORTED`: Available evidence corroborates the claim.
  - `CONTRADICTED`: Reliable evidence conflicts with the claim.
  - `INSUFFICIENT EVIDENCE`: Not enough reliable information is available.
  - `CONTEXT DEPENDENT`: The conclusion depends on circumstances, goals, or priorities.
  - `POTENTIALLY RISKY`: The proposed action creates severe downside exposure or irreversible harm.
- 🎯 **Fallacy & Bias Auditing**: Flags Survivorship Bias, Sunk Cost Fallacy, Hasty Generalizations, and False Dichotomies.
- 🛡️ **Dual-Mode AI Engine**:
  - **Live OpenAI Mode**: Connects to `gpt-4o` or `gpt-4o-mini` with structured JSON output enforcement.
  - **Analytical Heuristics Mode (Demo)**: Built-in deterministic engine that works offline with zero external API key requirements.
- 💬 **Interactive Follow-Up Q&A**: Interrogate previous analyses, adjust boundary constraints, and test counter-factual scenarios.
- 🗄️ **Persistent Database Storage**: Complete SQLite persistence via SQLAlchemy async ORM, with search, verdict filters, and single/bulk deletion.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js v18+** (v20+ recommended) & **npm**

---

### Step 1: Clone or Navigate to the Project
```bash
cd checkAI
```

---

### Step 2: Configure Environment Variables (Optional)
The application works immediately in **Demo Mode** without an API key! To enable live OpenAI reasoning:
```bash
cp .env.example .env
# Edit .env and enter your key:
# OPENAI_API_KEY=sk-...
```

---

### Step 3: Run the Backend
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Run automated tests
pytest -v

# Start the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now running at:
- **API Base:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/api/health`

---

### Step 4: Run the Frontend
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser at **`http://localhost:5173`** to access the platform.

---

## 📂 Project Structure

```
checkAI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, CORS, lifespan & error handlers
│   │   ├── config.py            # Settings using pydantic-settings
│   │   ├── database.py          # SQLAlchemy async session & engine
│   │   ├── models.py            # AnalysisRecord & FollowUpRecord ORM models
│   │   ├── schemas.py           # Pydantic v2 validation contracts
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py        # REST endpoints (/analyze, /history, /follow-up)
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── ai_service.py    # OpenAI dispatcher & Heuristics engine
│   │       └── search_service.py# Modular evidence retrieval
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py          # Pytest suite testing all 5 verdicts & endpoints
│   ├── requirements.txt
│   ├── pytest.ini
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Brand header with live connection status
│   │   │   ├── Footer.tsx       # Academic attribution & responsible AI notice
│   │   │   ├── VerdictBadge.tsx # Standardized colored verdict badges
│   │   │   └── FollowUpChat.tsx # Interactive post-analysis multi-turn chat
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx  # Hero, interactive preview & 5 verdicts showcase
│   │   │   ├── AnalyzePage.tsx  # Main analysis workspace & dashboard
│   │   │   ├── HistoryPage.tsx  # Database record viewer, search & deletion
│   │   │   └── AboutPage.tsx    # Technical methodology, architecture & viva guide
│   │   ├── services/
│   │   │   └── api.ts           # Typed API service client
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript data contracts
│   │   ├── App.tsx              # Tab router & prefill state manager
│   │   ├── index.css            # Tailwind custom dark navy theme
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── PROJECT_DOCUMENTATION.md     # Comprehensive University Viva & Project Report
├── .env.example
└── README.md
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health status, version, and AI provider state |
| `POST` | `/api/analyze` | Evaluates premise and persists record to database |
| `GET` | `/api/history` | Fetches saved analysis history with category/verdict filters |
| `GET` | `/api/history/{id}` | Retrieves full detail for a specific analysis |
| `DELETE` | `/api/history/{id}` | Deletes a single analysis record |
| `DELETE` | `/api/history` | Clears all history from the database |
| `POST` | `/api/follow-up` | Submits a clarifying question regarding an existing analysis |

---

## 🧪 Automated Testing

Run backend tests using `pytest`:
```bash
cd backend
pytest -v
```
All 8 test suites validate:
- System health endpoint
- Input validation (Pydantic 422 errors)
- All 5 verdict categories (`SUPPORTED`, `CONTRADICTED`, `INSUFFICIENT EVIDENCE`, `CONTEXT DEPENDENT`, `POTENTIALLY RISKY`)
- Complete database lifecycle (create, fetch list, fetch detail, delete)
- Follow-up Q&A processing

---

## 🎓 University Demonstration & Viva Voce Guide

Refer to [PROJECT_DOCUMENTATION.md](file:///c:/Users/bhanu/OneDrive/Desktop/checkAI/PROJECT_DOCUMENTATION.md) for full project abstract, problem statement, architecture diagrams, module explanations, and common faculty viva questions and model answers.
