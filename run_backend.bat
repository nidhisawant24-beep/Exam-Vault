@echo off
echo ========================================================
echo  ExamVault - Starting Backend (Flask REST API)
echo ========================================================
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
python app.py
pause
