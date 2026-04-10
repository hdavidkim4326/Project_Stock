@echo off
chcp 65001 >nul 2>&1
echo [Frontend] 포트 5173 정리 중...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    echo   기존 프로세스 PID %%a 종료 중...
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul
echo [Frontend] 서버 시작: http://localhost:5173
cd /d "%~dp0frontend"
npm run dev
