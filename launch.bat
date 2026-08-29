@echo off
title OmniLaunch
cd /d "%~dp0"
echo Starting OmniLaunch Workspace Orchestrator...
call npm.cmd run dev
pause
