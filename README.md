# Three-Stage RAG Integrity Shield

> **"We don't just secure what the user asks. We secure what the AI is allowed to learn from — and if a malicious source is discovered later, our system traces it back and removes its trust."**

A complete hackathon prototype demonstrating end-to-end security for Retrieval-Augmented Generation (RAG) systems. Built following the Megathon Master Build Specification.

---

## 🛡️ Architecture Highlights

1. **Stage 1: Secure Ingestion**
   - Heuristic / regex instruction injection detection (AI directives, delimiters, exfiltration prompts).
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

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation: `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Dashboard UI: `http://localhost:5173`

---

## 🧪 Running Tests
```bash
python -m pytest backend/tests -v
```

---

## 🌐 Deploying on Vercel

The repository is pre-configured with `vercel.json`, root `package.json`, and SPA rewrites for one-click deployment on [Vercel](https://vercel.com).

### Option A: Frontend on Vercel (Recommended)
1. Import your GitHub repository `https://github.com/Adithya010208/megaton` into Vercel.
2. Vercel automatically detects the build command:
   - **Build Command**: `npm run build --prefix frontend` (or `cd frontend && npm install && npm run build`)
   - **Output Directory**: `frontend/dist`
3. *(Optional)* If your backend is deployed separately (e.g. on Render, Railway, or Fly.io), add an environment variable in Vercel:
   - `VITE_API_BASE_URL` = `https://your-backend-api.onrender.com`
4. Click **Deploy**. Vercel will build and serve the application with seamless client-side routing.

### Option B: Monorepo Root Directory Setting
If you set the **Root Directory** in Vercel project settings to `frontend`:
- The included `frontend/vercel.json` ensures all routes (`/overview`, `/documents`, `/demo`, etc.) rewrite properly to `index.html` without 404 errors.

---

## 📁 Repository Structure

```text
├── api/
│   └── index.py            # Vercel serverless entry point (FastAPI ASGI)
├── backend/
│   ├── app/
│   │   ├── api/            # REST API routers (documents, retrieval, rag, security, demo)
│   │   ├── models/         # SQLite schema & repository operations
│   │   ├── schemas/        # Pydantic data contracts
│   │   ├── services/       # Stage 1 Scanner, Stage 2 Scoping, Stage 3 Inspector, Quarantine
│   │   └── main.py         # FastAPI application entry point
│   ├── tests/              # Pytest automated test suite (10/10 passing)
│   └── requirements.txt    # Backend Python dependencies
├── data/
│   └── uploads/            # Ingested documents storage
├── frontend/
│   ├── src/
│   │   ├── api/            # Unified API client with VITE_API_BASE_URL support
│   │   ├── components/     # AppLayout, Sidebar, Toast notifications
│   │   └── pages/          # All 13 cyber-console operation pages
│   ├── package.json        # Frontend React 19 + Vite dependencies
│   └── vercel.json         # SPA rewrite fallback configuration
├── vercel.json             # Root Vercel build & routing configuration
└── README.md
```

