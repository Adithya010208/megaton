#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  Three-Stage RAG Integrity Shield - Unix Launcher"
echo "========================================================"
echo ""

if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 could not be found. Please install Python 3.9+."
    exit 1
fi

if [ ! -d ".venv" ]; then
    echo "[INFO] Creating Python virtual environment in .venv ..."
    python3 -m venv .venv
fi

source .venv/bin/activate
python3 run.py "$@"
