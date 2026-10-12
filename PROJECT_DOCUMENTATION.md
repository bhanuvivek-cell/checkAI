# ASSUMPTION CHECK AI: TECHNICAL ARCHITECTURE & UNIVERSITY PROJECT SPECIFICATION

---

## 1. PROJECT ABSTRACT

**Assumption Check AI** is an intelligent, full-stack decision-analysis and critical-thinking platform engineered to evaluate assumptions, verify empirical claims, dissect logical fallacies, and estimate decision risks. Rather than functioning as a sycophantic chatbot or returning overconfident answers, the platform decomposes statements into foundational premises, categorizes statements across fact-versus-opinion spectrums, checks for cognitive biases, and issues calibrated epistemic verdicts across five distinct categories. The solution is built with a decoupled FastAPI (Python) backend, SQLAlchemy asynchronous ORM with SQLite (PostgreSQL compatible), and a high-performance React 18 TypeScript frontend styled with Tailwind CSS.

---

## 2. PROBLEM STATEMENT

In the contemporary information ecosystem, human decision-makers frequently fall victim to **unexamined assumptions**, **cognitive biases** (such as Confirmation Bias and Survivorship Bias), and **unhedged downside risk**. Simultaneously, standard Large Language Models often suffer from sycophancy—eagerly agreeing with user premises—or fabricating citations to provide an illusion of absolute certainty. 

There is an acute lack of software tools that:
1. Systematically isolate **implicit and hidden premises** before evaluating conclusions.
2. Distinguish empirical facts from subjective opinions and unverified predictions.
3. Classify decision validity beyond simplistic true/false dichotomies into **context-dependent** and **downside-risky** realities.
4. Encourage transparent uncertainty and iterative follow-up exploration without hallucinations.

---

## 3. OBJECTIVES AND SCOPE

### Objectives
- **Axiomatic Decomposition**: Extract explicit and hidden assumptions from natural language inputs.
- **Fallacy Auditing**: Identify formal and informal logical fallacies (e.g., False Dichotomy, Hasty Generalization, Sunk Cost Fallacy).
- **Epistemic Calibration**: Categorize claims into five strict verdicts: `SUPPORTED`, `CONTRADICTED`, `INSUFFICIENT EVIDENCE`, `CONTEXT DEPENDENT`, and `POTENTIALLY RISKY`.
- **Dual-Mode AI Engine**: Support live OpenAI LLM execution while providing a zero-dependency deterministic heuristic analytical engine for offline demonstration.
- **Persistent Relational Auditing**: Persist analyses in an asynchronous database with search, filtering, and interactive follow-up Q&A capabilities.

### Scope
- **Analytical Categories**: General Assumption, Fact Check, Personal Decision, Logical Fallacy, and Risk Analysis.
- **Decision Guidance**: Provides recommended next steps, calibrated alternative pathways, and confidence metrics with explicit derivation bases.
- **Boundary**: Acts as an epistemic assistant; does not replace licensed medical, legal, or certified fiduciary counsel.

---

## 4. SYSTEM ARCHITECTURE

```mermaid
graph TD
    subgraph Frontend ["Frontend Client (React + TypeScript + Vite)"]
        UI_Home[Landing Page & Hero]
        UI_Workspace[Analytical Workspace]
        UI_History[Persistent History & Filters]
        UI_About[Methodology & Viva Specs]
        API_Client[Typed API Service]
    end

    subgraph Backend ["Backend Engine (FastAPI + Python 3.12)"]
        Router[REST API Router /api]
        Val[Pydantic v2 Schemas & Validation]
        
        subgraph Engine ["Assumption Analysis Engine"]
            AI_Router{AI Provider Dispatcher}
            OpenAI_Service[OpenAI GPT-4o Client]
            Heuristic_Engine[Analytical Heuristics Engine Demo Mode]
            Search_Service[Evidence Search Service]
        end
        
        DB_Layer[SQLAlchemy 2.0 Async Session]
    end

    subgraph Database ["Relational Storage"]
        SQLite[(SQLite / PostgreSQL aiosqlite)]
    end

    UI_Workspace -->|HTTP POST /api/analyze| Router
    UI_History -->|HTTP GET /api/history| Router
    UI_History -->|HTTP DELETE /api/history| Router
    API_Client --> Router
    Router --> Val
    Val --> AI_Router
    AI_Router -->|Key Present| OpenAI_Service
    AI_Router -->|Key Missing / Fallback| Heuristic_Engine
    AI_Router --> Search_Service
    OpenAI_Service --> DB_Layer
    Heuristic_Engine --> DB_Layer
    DB_Layer --> SQLite
```

---

## 5. MODULE DESCRIPTIONS

### 5.1 Frontend Modules (`frontend/src/`)
- **`components/Navbar.tsx`**: Navigation header displaying real-time system connection status (OpenAI Live vs Heuristics Demo) with responsive mobile drawer.
- **`components/VerdictBadge.tsx`**: Standardized badges with accessible color coding, Lucide icons, and descriptions for all 5 verdict types.
- **`components/FollowUpChat.tsx`**: Dynamic multi-turn inquiry component enabling users to probe specific edge cases and adjust assumptions post-analysis.
- **`pages/LandingPage.tsx`**: Showcase with interactive analysis preview, 5-verdict breakdown, feature cards, and 4-step pipeline flow.
- **`pages/AnalyzePage.tsx`**: Primary workspace featuring category selection, text length monitoring, pre-set academic prompt chips, animated multi-step progress bar, and comprehensive result dashboard.
- **`pages/HistoryPage.tsx`**: Searchable and filterable database record viewer with detail drawer, single-item deletion, and clear-history controls.
- **`pages/AboutPage.tsx`**: Educational documentation detailing project vision, critical thinking rationale, system architecture, and responsible AI usage.

### 5.2 Backend Modules (`backend/app/`)
- **`config.py`**: Settings management using `pydantic-settings` with automatic `.env` resolution, CORS origins parser, and demo mode flag.
- **`database.py`**: SQLAlchemy 2.0 asynchronous engine and session maker compatible with SQLite (`aiosqlite`) and PostgreSQL (`asyncpg`).
- **`models.py`**: Relational ORM models for `AnalysisRecord` and `FollowUpRecord` with cascading deletions and JSON serialization.
- **`schemas.py`**: Pydantic v2 schemas defining input validation (`AnalysisRequest`, `FollowUpRequest`) and rich data contracts (`AnalysisResponse`, `ConfidenceMetric`, `FactOpinionItem`).
- **`services/ai_service.py`**: Core analysis pipeline. Dispatches to OpenAI with JSON object response formatting or executes the deterministic analytical heuristics engine.
- **`services/search_service.py`**: Modular evidence retriever designed to query external search APIs or yield verified reference guidelines without hallucinating citations.
- **`api/routes.py`**: REST API endpoints for health monitoring, analysis creation, history querying, single/bulk deletion, and follow-up inquiry.

---

## 6. THE FIVE CALIBRATED VERDICTS

| Verdict | Meaning | Primary Trigger Criteria |
| :--- | :--- | :--- |
| **`SUPPORTED`** | Available evidence corroborates the claim. | Direct corroboration by established empirical consensus, verified documentation, or physical laws. |
| **`CONTRADICTED`** | Reliable evidence directly conflicts with the claim. | Empirical consensus, mathematical proof, or recorded history conclusively disproves the premise. |
| **`INSUFFICIENT EVIDENCE`** | Not enough reliable information is available. | Underspecified inputs, absent baseline constraints, unmeasurable predictions, or missing variables. |
| **`CONTEXT DEPENDENT`** | Validity depends on circumstances or priorities. | Subjective trade-offs, personal utility functions, varying budget, or timeline conditions. |
| **`POTENTIALLY RISKY`** | The action could create meaningful harm. | Asymmetric downside exposure, irreversible capital/career commitment, lack of margin of safety. |

---

## 7. AUTOMATED TEST CASES & EVALUATION METHODOLOGY

The automated test suite (`backend/tests/test_api.py`) runs via `pytest` with `pytest-asyncio`:

1. **`test_health_check`**: Asserts system availability, versioning, and environment mode reporting.
2. **`test_analyze_empty_or_invalid_request`**: Validates Pydantic schema rejection of inputs under 5 characters (HTTP 422).
3. **`test_analyze_supported_verdict`**: Evaluates verified empirical claims (e.g., cardiovascular exercise) for `SUPPORTED` verdict and high confidence score.
4. **`test_analyze_contradicted_verdict`**: Evaluates pseudoscientific claims (e.g., flat Earth) for `CONTRADICTED` verdict and conspiracy fallacy detection.
5. **`test_analyze_potentially_risky_verdict`**: Evaluates reckless decisions (e.g., dropping out for unverified crypto) for `POTENTIALLY RISKY` verdict and survivorship bias detection.
6. **`test_analyze_insufficient_evidence_verdict`**: Tests vague or underspecified inputs for `INSUFFICIENT EVIDENCE` verdict.
7. **`test_analyze_context_dependent_verdict`**: Tests absolute generalizations (e.g., remote work is always superior) for `CONTEXT DEPENDENT` verdict.
8. **`test_history_and_follow_up_workflow`**: Tests complete end-to-end lifecycle: creation $\rightarrow$ database retrieval $\rightarrow$ follow-up Q&A submission $\rightarrow$ record deletion.

---

## 8. VIVA VOCE QUESTIONS & MODEL ANSWERS

**Q1: How does Assumption Check AI prevent AI hallucinations?**  
*Answer:* The platform implements a strict system prompt forbidding the generation of phantom citations, statistics, or quotes. Evidence retrieval is isolated in a modular service (`search_service.py`), ensuring that factual verification is decoupled from the model's subjective text generation. If no search provider is active, the engine explicitly acknowledges the absence of external evidence rather than fabricating links.

**Q2: How does the application operate when no OpenAI API key is provided?**  
*Answer:* The system features a built-in Analytical Heuristics Engine. When `OPENAI_API_KEY` is absent, the backend transitions automatically into a clearly labeled Demo Mode (`is_demo_mode: true`). It applies linguistic pattern recognition, fallacy catalog mapping, and risk-modeling heuristics to deliver complete, structured analysis reports.

**Q3: How is data persistence handled and can this migrate to PostgreSQL?**  
*Answer:* We utilize SQLAlchemy 2.0 with asynchronous drivers (`aiosqlite`). All relational entities (`AnalysisRecord`, `FollowUpRecord`) adhere to standard SQL data types with native JSON columns. Migrating to PostgreSQL simply requires updating the connection string in `.env` to `postgresql+asyncpg://user:pass@host:5432/dbname` with zero ORM code alterations.

**Q4: What makes the confidence score meaningful rather than arbitrary?**  
*Answer:* The confidence metric consists of a quantitative score (0-100), a categorical rating (High, Moderate, Low), and an explicit **basis statement** defining how the score was calculated (e.g., presence of empirical consensus, severity of downside variables, or scarcity of operational context).

---

## 9. FUTURE ENHANCEMENTS

1. **Multi-Agent Dialectical Debate**: Incorporate an automated "Devil's Advocate" subagent to iteratively challenge the model's own conclusions.
2. **User Authentication & Workspaces**: Add JWT authentication with role-based team collaboration on complex corporate decisions.
3. **Graph Visualizer**: Generate visual interactive DAGs (Directed Acyclic Graphs) of argument premises and their dependency weights.
