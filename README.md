# Three-Stage RAG Integrity Shield

> **"We don't just secure what the user asks. We secure what the AI is allowed to learn from — and if a malicious source is discovered later, our system traces it back and removes its trust."**

An enterprise cybersecurity platform demonstrating end-to-end security for Retrieval-Augmented Generation (RAG) systems.

---

## 🛡️ Architecture Highlights

1. **Stage 1: Secure Ingestion**
   - Heuristic and regex instruction injection detection (AI directives, delimiters, exfiltration prompts).
   - Domain-fit anomaly scoring & lexical stuffing analysis.
   - Tri-state policy: `ALLOW`, `QUARANTINE`, or `BLOCK` before chunks enter the retrievable candidate pool.

2. **Stage 2: Authorization-Scoped Retrieval**
   - Hard authorization scoping (`tenant_id`, `role`, `authorized_scope`) executed **before** similarity search.
   - Cross-tenant isolation guaranteed at candidate formation; never widened when evidence is sparse.
   - Safe explicit `insufficient-authorized-context` response.

3. **Stage 3: Output Inspection**
   - Instruction echo detection and unsolicited external URL / exfiltration monitoring.
   - Claim-to-source chunk prototype grounding (verifies each claim maps to supporting evidence).

4. **Primary Innovation: Closed-Loop Retroactive Quarantine**
   - Dynamically resolves detected malicious chunks back to their originating source document.
   - Updates document and chunk trust state to `quarantined`/`demoted` in persistent SQLite storage.
   - Automatically purges malicious sources from all subsequent retrievals.

---

## 🚀 Quick Start (Easiest Way to Run on Any Laptop)

### 💻 Windows (1-Click Auto-Setup & Launch)
Simply double-click:
```text
run.bat
```
> **What it does automatically:** Creates a Python virtual environment, installs all backend dependencies from `backend/requirements.txt`, launches the complete system on `http://localhost:8000`, and opens your default browser. **No Node.js or npm required.**

---

### 🍏 macOS / 🐧 Linux (1-Command Launch)
```bash
chmod +x run.sh && ./run.sh
```

---

### 🐍 Cross-Platform (Python Only)
```bash
python run.py
```
*(To run full development mode with Vite hot-reload on port 5173: `python run.py --dev`)*

---

### 🐳 Docker (Zero Local Dependencies)
```bash
docker compose up
```
Open **`http://localhost:8000`** in your browser.

---

## 🧪 Running Tests
```bash
python -m pytest backend/tests -v
```

---

## 🌐 Deploying on Vercel

The repository is pre-configured with `vercel.json`, root `package.json`, and SPA rewrites for one-click deployment on [Vercel](https://vercel.com).

- **Live URL**: [https://megaton-three.vercel.app](https://megaton-three.vercel.app)
- Includes a client-side Cloud Sandbox mode so all consoles, KPI cards, and attack scenarios run interactively in cloud demo environments.

---

## 📁 Repository Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/            # REST API routers (documents, retrieval, rag, security, demo)
│   │   ├── models/         # SQLite schema & repository operations
│   │   ├── schemas/        # Pydantic data contracts
│   │   ├── services/       # Stage 1 Scanner, Stage 2 Scoping, Stage 3 Inspector, Quarantine
│   │   └── main.py         # FastAPI application entry point
│   ├── data/
│   │   └── seed_documents/ # Deterministic scenario seed documents
│   ├── tests/              # Pytest automated test suite (10/10 passing)
│   ├── pyproject.toml      # Python package definition
│   └── requirements.txt    # Backend Python dependencies
├── data/
│   └── uploads/            # Ingested documents storage
├── frontend/
│   ├── src/
│   │   ├── api/            # Unified API client with Cloud Sandbox fallback
│   │   ├── components/     # AppLayout, Sidebar, Toast notifications
│   │   └── pages/          # All 13 cyber-console operation pages
│   ├── package.json        # Frontend React 19 + Vite dependencies
│   └── vercel.json         # SPA rewrite fallback configuration
├── run.bat                 # Windows 1-click launcher
├── run.sh                  # macOS/Linux launcher
├── run.py                  # Universal cross-platform launcher
├── Dockerfile              # Container definition
├── docker-compose.yml      # Multi-platform orchestration
├── vercel.json             # Root Vercel build & routing configuration
└── README.md
```
