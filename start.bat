@echo off
setlocal

set "ROOT=%~dp0"
cd /d "%ROOT%"

echo Starting Customizable Inventory Management System...
echo.

if exist "%ROOT%.venv\Scripts\activate.bat" (
    start "Inventory Backend" cmd /k "cd /d "%ROOT%backend" && call "%ROOT%.venv\Scripts\activate.bat" && uvicorn app.main:app --reload --port 8000"
) else (
    start "Inventory Backend" cmd /k "cd /d "%ROOT%backend" && python -m uvicorn app.main:app --reload --port 8000"
)

where pnpm >nul 2>&1
if %errorlevel%==0 (
    start "Inventory Frontend" cmd /k "cd /d "%ROOT%frontend" && pnpm dev"
) else (
    start "Inventory Frontend" cmd /k "cd /d "%ROOT%frontend" && npm run dev"
)

echo Services started in separate terminals.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
