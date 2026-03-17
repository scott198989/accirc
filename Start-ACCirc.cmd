@echo off
setlocal
title AC Circuits Calculator
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-ACCirc.ps1"
exit /b %errorlevel%
