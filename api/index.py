import os
import sys
from pathlib import Path

# Add project root to Python path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# Expose FastAPI ASGI app
from backend.app.main import app
