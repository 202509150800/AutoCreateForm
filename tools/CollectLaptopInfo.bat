@echo off
chcp 65001 >nul
echo ========================================
echo   Laptop 資訊收集工具
echo ========================================
echo.

REM 設定輸出路徑 (可改為 USB 路徑，如 E:\LaptopData)
set OUTPUT_DIR=%~dp0output
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

REM 生成檔案名：L + 年月日時分秒
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set ID=L%datetime:~0,14%
set OUTPUT_FILE=%OUTPUT_DIR%\%ID%.txt

echo 正在收集資訊...
echo.

REM 執行 PowerShell 腳本收集資訊
powershell -ExecutionPolicy Bypass -File "%~dp0CollectLaptopInfo.ps1" -OutputFile "%OUTPUT_FILE%" -ID "%ID%"

echo.
echo ========================================
echo   完成！
echo   檔案已儲存到: %OUTPUT_FILE%
echo ========================================
echo.
pause
