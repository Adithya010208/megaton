"""
Three-Stage RAG Integrity Shield - Universal Local Launcher
Runs the complete cybersecurity platform with automatic dependency management.

Usage:
    python run.py          # Unified mode (FastAPI serves React UI on http://localhost:8000)
    python run.py --dev    # Development mode (FastAPI on :8000 + Vite HMR on :5173)
"""

import os
import sys
import shutil
import subprocess
import webbrowser
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
REQUIREMENTS_FILE = ROOT_DIR / "backend" / "requirements.txt"
if not REQUIREMENTS_FILE.exists():
    REQUIREMENTS_FILE = ROOT_DIR / "requirements.txt"
FRONTEND_DIR = ROOT_DIR / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"

REQUIRED_MODULES = [
    ("fastapi", "fastapi"),
    ("uvicorn", "uvicorn"),
    ("pydantic", "pydantic"),
    ("sklearn", "scikit-learn"),
    ("numpy", "numpy"),
    ("pypdf", "pypdf"),
]

def print_banner():
    print("=" * 64)
    print("   Three-Stage RAG Integrity Shield - Auto Launcher")
    print("   Secure Ingestion | Authorized Retrieval | Output Inspection")
    print("=" * 64)

def check_python_version():
    if sys.version_info < (3, 9):
        print(f"[ERROR] Python 3.9+ is required. You are running Python {sys.version.split()[0]}.")
        sys.exit(1)

def install_python_dependencies():
    missing = []
    for mod_name, pkg_name in REQUIRED_MODULES:
        try:
            __import__(mod_name)
        except ImportError:
            missing.append(pkg_name)
    
    if missing:
        print(f"\n[INFO] Missing Python dependencies: {', '.join(missing)}")
        print("[INFO] Automatically installing dependencies from requirements.txt...")
        try:
            cmd = [sys.executable, "-m", "pip", "install", "-r", str(REQUIREMENTS_FILE)]
            subprocess.check_call(cmd)
            print("[SUCCESS] All Python dependencies installed successfully!\n")
        except subprocess.CalledProcessError as e:
            print(f"[ERROR] Failed to install Python dependencies: {e}")
            print("Please run manually: pip install -r requirements.txt")
            sys.exit(1)
    else:
        print("[OK] All Python dependencies are satisfied.")

def ensure_frontend_built():
    """Ensures frontend/dist exists so FastAPI can serve the full UI."""
    index_html = DIST_DIR / "index.html"
    if not index_html.exists():
        print("\n[INFO] Pre-compiled frontend not found in frontend/dist.")
        npm_bin = shutil.which("npm")
        if npm_bin:
            print("[INFO] Node/npm detected. Building frontend assets...")
            try:
                subprocess.check_call([npm_bin, "install"], cwd=str(FRONTEND_DIR), shell=(os.name == 'nt'))
                subprocess.check_call([npm_bin, "run", "build"], cwd=str(FRONTEND_DIR), shell=(os.name == 'nt'))
                print("[SUCCESS] Frontend assets built successfully!\n")
            except Exception as e:
                print(f"[WARN] Could not build frontend: {e}")
        else:
            print("[WARN] Node.js not found. Running with API endpoints only.")

def run_dev_mode():
    """Runs backend and frontend in separate processes for full hot-reloading dev."""
    npm_bin = shutil.which("npm")
    if not npm_bin:
        print("[ERROR] Node.js/npm is required for --dev mode.")
        print("[INFO] Falling back to unified mode (FastAPI serving pre-built UI)...")
        run_unified_mode()
        return

    # Check node_modules
    if not (FRONTEND_DIR / "node_modules").exists():
        print("[INFO] Installing frontend node_modules...")
        subprocess.check_call([npm_bin, "install"], cwd=str(FRONTEND_DIR), shell=(os.name == 'nt'))

    print("\n[INFO] Starting Vite Frontend on http://localhost:5173 ...")
    fe_proc = subprocess.Popen([npm_bin, "run", "dev"], cwd=str(FRONTEND_DIR), shell=(os.name == 'nt'))

    print("[INFO] Starting FastAPI Backend on http://localhost:8000 ...")
    be_cmd = [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    
    # Open browser after short delay
    def open_browser():
        time.sleep(2)
        webbrowser.open("http://localhost:5173")
    
    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    try:
        subprocess.check_call(be_cmd)
    except KeyboardInterrupt:
        print("\n[INFO] Shutting down development servers...")
    finally:
        fe_proc.terminate()

def run_unified_mode():
    """Runs FastAPI which serves both the React UI and all API routes on http://localhost:8000."""
    ensure_frontend_built()

    print("\n" + "-" * 64)
    print("  Server is live!")
    print("  Web Console : http://localhost:8000")
    print("  Swagger Docs : http://localhost:8000/docs")
    print("  Health Check : http://localhost:8000/health")
    print("-" * 64 + "\n")

    def open_browser():
        time.sleep(1.5)
        print("[INFO] Opening application in your default browser...")
        webbrowser.open("http://localhost:8000")

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    import uvicorn
    from backend.app.main import app
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    print_banner()
    check_python_version()
    install_python_dependencies()

    if "--dev" in sys.argv:
        run_dev_mode()
    else:
        run_unified_mode()
