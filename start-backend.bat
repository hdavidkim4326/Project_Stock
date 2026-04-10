@echo off
chcp 65001 >nul 2>&1
echo [Backend] 포트 8003 정리 중...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8003 " ^| findstr "LISTENING"') do (
    echo   기존 프로세스 PID %%a 종료 중...
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul
echo [Backend] 서버 시작: http://localhost:8003
cd /d "%~dp0backend"
call venv\Scripts\activate
uvicorn main:app --reload --port 8003
