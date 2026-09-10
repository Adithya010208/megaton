import os
from typing import List
from pydantic import BaseModel, Field

class Settings(BaseModel):
    PROJECT_NAME: str = "Three-Stage RAG Integrity Shield"
    VERSION: str = "1.0.0"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/megaton_shield.db")
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "deterministic_mock")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Security Thresholds
    INJECTION_SENSITIVITY: float = float(os.getenv("INJECTION_SENSITIVITY", "0.75"))
    ANOMALY_CONTAMINATION: float = float(os.getenv("ANOMALY_CONTAMINATION", "0.10"))
    LEXICAL_STUFFING_THRESHOLD: float = float(os.getenv("LEXICAL_STUFFING_THRESHOLD", "0.65"))
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.20"))

settings = Settings()

