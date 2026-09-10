@echo off
setlocal
title Three-Stage RAG Integrity Shield Launcher
echo ========================================================
echo   Three-Stage RAG Integrity Shield - Windows Launcher
echo ========================================================
echo.

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python was not found in your system PATH!
    echo Please download and install Python from: https://www.python.org/downloads/
    echo Make sure to check the box "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

:: Set up virtualenv if not present
if not exist ".venv" (
    echo [INFO] Creating Python virtual environment in .venv ...
    python -m venv .venv
)

:: Activate virtualenv
call .venv\Scripts\activate.bat

:: Run universal launcher (auto-installs dependencies and opens browser)
python run.py %*

pause
