@echo off
echo ========================================================
echo  ExamVault - Starting Full-Stack Application
echo ========================================================
echo 1. Launching Flask Backend on http://127.0.0.1:5000
start "ExamVault Backend (Flask)" cmd /k "run_backend.bat"

timeout /t 3 /nobreak >nul

echo 2. Launching React Frontend on http://localhost:5173
start "ExamVault Frontend (Vite)" cmd /k "run_frontend.bat"

echo ========================================================
echo Both servers are launching!
echo Access the web application at: http://localhost:5173
echo ========================================================
pause
