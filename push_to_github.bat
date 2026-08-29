@echo off
title Push OmniLaunch to GitHub
cd /d "%~dp0"
echo ========================================================
echo   OmniLaunch v1.1.0 — Push to GitHub
echo ========================================================
echo.
echo Running: git push -u origin main
echo (If prompted, please sign in via your browser)
echo.
git push -u origin main
echo.
pause
