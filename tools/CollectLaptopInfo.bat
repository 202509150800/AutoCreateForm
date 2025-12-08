@echo off
chcp 65001 >nul
echo ========================================
echo   Laptop Info Collection Tool
echo ========================================
echo.

REM Execute PowerShell script (auto saves to output folder)
powershell -ExecutionPolicy Bypass -File "%~dp0CollectLaptopInfo.ps1"

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
pause
