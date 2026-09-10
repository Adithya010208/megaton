import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import settings
from backend.app.database import init_db
from backend.app.services.demo_seed_service import DemoSeedService
from backend.app.models.repository import Repository
from backend.app.api.documents import router as documents_router
from backend.app.api.retrieval import router as retrieval_router
from backend.app.api.rag import router as rag_router
from backend.app.api.security import router as security_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.demo import router as demo_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("rag_integrity_shield")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Three-Stage RAG Integrity Shield backend...")
    init_db()
    # Seed deterministic demo data if repository is empty
    existing_docs = Repository.list_documents()
    if not existing_docs:
        logger.info("Initializing deterministic demo seed data...")
        DemoSeedService.seed_data(scan_stage1=True)
    yield
    logger.info("Shutting down Three-Stage RAG Integrity Shield backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    description="Three-Stage RAG Integrity Shield: Secure Ingestion, Authorized Retrieval, Output Inspection, and Closed-Loop Retroactive Quarantine."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev & demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler for consistent API error responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error handling {request.method} {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error_type": type(exc).__name__,
            "message": str(exc),
            "path": str(request.url.path)
        }
    )

# Foundation /health endpoint
@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "OK",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "llm_provider": settings.LLM_PROVIDER,
        "security_pipeline": {
            "stage_1_ingestion": "ACTIVE",
            "stage_2_authorized_retrieval": "ACTIVE",
            "stage_3_output_inspection": "ACTIVE",
            "closed_loop_quarantine": "ACTIVE"
        }
    }

# Register all API routers
app.include_router(documents_router)
app.include_router(retrieval_router)
app.include_router(rag_router)
app.include_router(security_router)
app.include_router(dashboard_router)
app.include_router(demo_router)

# Direct endpoint alias from master spec: GET /api/requests/{request_id}/trace
@app.get("/api/requests/{request_id}/trace", tags=["retrieval"])
def get_request_trace(request_id: str):
    trace = Repository.get_retrieval_trace(request_id)
    if not trace:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Retrieval trace not found")
    return trace

# Static assets & SPA fallback routing for unified Vercel deployment
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

DIST_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if DIST_DIR.exists():
    assets_dir = DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_or_static(request: Request, full_path: str):
        if full_path.startswith("api/") or full_path == "api" or full_path == "health" or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
        
        # If request is at root: return JSON for API clients/tests, or HTML for browser navigation
        if not full_path or full_path == "/":
            accept = request.headers.get("accept", "")
            if "text/html" not in accept or "application/json" in accept:
                return {
                    "message": "Three-Stage RAG Integrity Shield API is running.",
                    "docs_url": "/docs",
                    "health_check": "/health"
                }
        
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(DIST_DIR / "index.html"))
else:
    @app.get("/", tags=["root"])
    def root():
        return {
            "message": "Three-Stage RAG Integrity Shield API is running.",
            "docs_url": "/docs",
            "health_check": "/health"
        }

