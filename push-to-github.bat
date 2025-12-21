@echo off
REM AutoCreateForm - GitHub 推送腳本
REM 使用方法: 右鍵點擊此文件 → 用管理員身份運行

cd /d "C:\Users\fung\Desktop\2025\test\AutoCreateForm"

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         🚀 AutoCreateForm GitHub 推送腳本                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM 第一步: 檢查遠程
echo 📊 檢查 Git 遠程...
git remote -v
echo.

REM 第二步: 檢查是否需要設置遠程
echo 🔗 設置遠程倉庫...
echo 請輸入你的 GitHub 用戶名: 
set /p USERNAME=
git remote remove origin 2>nul
git remote add origin https://github.com/%USERNAME%/AutoCreateForm.git
echo ✓ 遠程已設置: https://github.com/%USERNAME%/AutoCreateForm.git
echo.

REM 第三步: 提交更改
echo 📝 添加更改...
git add -A
echo ✓ 已添加
echo.

echo 💬 提交更改...
git commit -m "chore: update LICENSE with detailed AI models information" 2>nul || echo ✓ 已提交或無新更改
echo.

REM 第四步: 推送
echo 🚀 推送到 GitHub...
git push -u origin main
echo.

REM 驗證
if %errorlevel% equ 0 (
    echo ╔════════════════════════════════════════════════════════════════╗
    echo ║                 ✅ 推送成功！              ║
    echo ╚════════════════════════════════════════════════════════════════╝
    echo.
    echo 查看你的倉庫: https://github.com/%USERNAME%/AutoCreateForm
) else (
    echo ❌ 推送失敗，請檢查:
    echo   1. GitHub 用戶名是否正確
    echo   2. 是否已在 GitHub 上創建倉庫
    echo   3. 是否已設置認證 (token 或 SSH)
)

pause
