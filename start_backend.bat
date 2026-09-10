@echo off
echo ========================================================
echo  Starting Three-Stage RAG Integrity Shield Backend API
echo  FastAPI running on http://localhost:8000
echo  Interactive Swagger docs at http://localhost:8000/docs
echo ========================================================
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
pause

