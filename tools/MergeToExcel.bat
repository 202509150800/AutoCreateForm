@echo off
chcp 65001 >nul
echo ========================================
echo   TXT 合併到 Excel 工具
echo ========================================
echo.

REM 執行 PowerShell 腳本
powershell -ExecutionPolicy Bypass -File "%~dp0MergeToExcel.ps1" -InputFolder "%~dp0output" -OutputFile "%~dp0LaptopInventory.csv"

pause
