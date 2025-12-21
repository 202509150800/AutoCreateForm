# 🚀 推上 GitHub 指南

## 步驟 1: 在 GitHub 上創建倉庫

### 方式 A: 使用網頁 (推薦新手)

1. 打開 GitHub: https://github.com/new
2. 填寫倉庫信息:
   ```
   Repository name: AutoCreateForm
   Description: AI-Powered Batch Document Generation Tool
   Public / Private: 選擇 Public (開源) 或 Private (私有)
   ```
3. **不要**勾選 "Initialize this repository with"
4. 點擊 "Create repository"

### 方式 B: 使用 GitHub CLI (推薦有經驗的用戶)

```bash
# 安裝 GitHub CLI (如果還沒安裝)
# 下載: https://cli.github.com/

# 創建倉庫
gh repo create AutoCreateForm --public --source=. --remote=origin --push
```

---

## 步驟 2: 連接本地倉庫到 GitHub

### 如果你在 GitHub 上已經創建了倉庫

替換 `<YOUR_USERNAME>` 為你的 GitHub 用戶名:

```bash
cd c:\Users\fung\Desktop\2025\test\AutoCreateForm

# 添加遠程倉庫
git remote add origin https://github.com/<YOUR_USERNAME>/AutoCreateForm.git

# 驗證
git remote -v
```

### 如果已經有遠程倉庫了

```bash
# 檢查現有遠程
git remote -v

# 如果需要更新遠程 URL
git remote set-url origin https://github.com/<YOUR_USERNAME>/AutoCreateForm.git
```

---

## 步驟 3: 推送到 GitHub

### 如果是新倉庫 (第一次推送)

```bash
cd c:\Users\fung\Desktop\2025\test\AutoCreateForm

# 重命名分支為 main (如果還是 master)
git branch -M main

# 推送
git push -u origin main
```

### 如果已經推送過

```bash
cd c:\Users\fung\Desktop\2025\test\AutoCreateForm

# 查看狀態
git status

# 如果有更改
git add -A
git commit -m "chore: update LICENSE with detailed AI models information"

# 推送
git push origin main
```

---

## 步驟 4: 認證 (如果遇到)

### 使用個人訪問令牌 (推薦)

1. 進入 GitHub Settings: https://github.com/settings/tokens
2. 點擊 "Generate new token (classic)"
3. 勾選權限:
   ```
   ☑ repo (完整控制私有倉庫)
   ☑ workflow (GitHub Actions)
   ☑ gist
   ```
4. 生成令牌，複製保存
5. Git 提示輸入密碼時，粘貼令牌

### 使用 SSH (高級)

```bash
# 1. 生成 SSH 密鑰 (如果還沒有)
ssh-keygen -t ed25519 -C "fung@example.com"

# 2. 添加到 GitHub: https://github.com/settings/ssh/new
# 3. 測試連接
ssh -T git@github.com

# 4. 更改遠程 URL
git remote set-url origin git@github.com:<YOUR_USERNAME>/AutoCreateForm.git

# 5. 推送
git push -u origin main
```

---

## 快速檢查清單

在推送前驗證:

```bash
cd c:\Users\fung\Desktop\2025\test\AutoCreateForm

# ✓ 檢查 git 配置
git config --global user.name
git config --global user.email

# ✓ 檢查本地狀態
git status

# ✓ 檢查提交日誌
git log --oneline -5

# ✓ 檢查遠程
git remote -v
```

---

## 一鍵推送腳本

將以下內容保存為 `push.sh` 然後運行:

```bash
#!/bin/bash
cd c:\Users\fung\Desktop\2025\test\AutoCreateForm

echo "📝 添加更改..."
git add -A

echo "💬 提交..."
git commit -m "chore: update LICENSE with detailed AI models information"

echo "🚀 推送..."
git push -u origin main

echo "✅ 完成！"
echo "查看: https://github.com/<YOUR_USERNAME>/AutoCreateForm"
```

或在 PowerShell 中:

```powershell
# push.ps1
cd c:\Users\fung\Desktop\2025\test\AutoCreateForm
git add -A
git commit -m "chore: update LICENSE with detailed AI models information"
git push -u origin main
Write-Host "✅ 推送完成！" -ForegroundColor Green
```

---

## 推送後驗證

1. 打開 https://github.com/<YOUR_USERNAME>/AutoCreateForm
2. 驗證:
   - ✅ 所有文件都在那裡
   - ✅ README.md 顯示正確
   - ✅ LICENSE 包含 AI 開發說明
   - ✅ 提交歷史正確

---

## 常見問題

### Q1: 遠程已存在如何處理?
```bash
git remote remove origin
git remote add origin https://github.com/<YOUR_USERNAME>/AutoCreateForm.git
```

### Q2: 分支名不對如何改?
```bash
git branch -M master main
git push -u origin main
```

### Q3: 推送被拒絕
```bash
# 首先拉取最新
git pull origin main

# 解決衝突後推送
git push origin main
```

### Q4: 忘記添加什麼如何補救?
```bash
# 修改最後一次提交
git add <forgotten_file>
git commit --amend --no-edit
git push --force-with-lease origin main
```

---

## 推送後的建議操作

### 1. 添加 README 徽章
在 README.md 頂部添加:
```markdown
[![GitHub stars](https://img.shields.io/github/stars/<YOUR_USERNAME>/AutoCreateForm)](https://github.com/<YOUR_USERNAME>/AutoCreateForm)
[![GitHub license](https://img.shields.io/github/license/<YOUR_USERNAME>/AutoCreateForm)](https://github.com/<YOUR_USERNAME>/AutoCreateForm/blob/main/LICENSE)
```

### 2. 配置 GitHub Pages (可選)
1. 進入 Settings → Pages
2. 選擇 "Deploy from a branch"
3. 選擇 "main" 分支
4. 文件夾選擇 "/ (root)"

### 3. 啟用 GitHub Actions (可選)
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

---

## 完成清單

- [ ] GitHub 帳戶已創建
- [ ] 倉庫已在 GitHub 上創建
- [ ] 本地 git 已配置
- [ ] 遠程已添加
- [ ] 文件已推送
- [ ] GitHub 上可見所有文件
- [ ] LICENSE 已更新
- [ ] README 在 GitHub 上顯示正確

---

## 🎉 推送成功標誌

```
✅ 遠程已設置
✅ 分支已推送
✅ GitHub 上可見
✅ 提交歷史正確
✅ 許可證清晰

您的項目已公開發布! 🚀
```

---

*最後更新*: 2025-01-01  
*版本*: v1.0
