# AutoCreateForm 推上 GitHub - 快速指南

## 🎯 3 分鐘快速推送

### 方法 1: 使用自動腳本 (最簡單) ⭐ 推薦

1. **雙擊** `push-to-github.bat` 文件
2. 輸入你的 **GitHub 用戶名**
3. 等待完成
4. 完成！訪問你的倉庫

### 方法 2: 手動命令行

#### 第一步: 在 GitHub 創建倉庫
```
1. 訪問: https://github.com/new
2. Repository name: AutoCreateForm
3. 選擇: Public
4. 點擊: Create repository
```

#### 第二步: 推送代碼 (複製粘貼)
```powershell
# 進入項目目錄
cd "C:\Users\fung\Desktop\2025\test\AutoCreateForm"

# 替換 <YOUR_USERNAME> 為你的 GitHub 用戶名
git remote add origin https://github.com/<YOUR_USERNAME>/AutoCreateForm.git

# 推送
git branch -M main
git push -u origin main
```

---

## 📋 詳細步驟說明

### 步驟 1: GitHub 準備 (2 分鐘)

**在 GitHub 上創建倉庫**:
1. 登錄 https://github.com
2. 點擊右上角 **+** → **New repository**
3. 填寫:
   ```
   Repository name: AutoCreateForm
   Description: AI-Powered Batch Document Generation Tool
   Public ✓
   ```
4. 點擊 **Create repository**

### 步驟 2: 本地推送 (1 分鐘)

在 PowerShell 或 CMD 中運行:

```powershell
# 進入項目目錄
cd "C:\Users\fung\Desktop\2025\test\AutoCreateForm"

# 設置遠程 (替換 USERNAME)
git remote add origin https://github.com/USERNAME/AutoCreateForm.git

# 確認分支名
git branch -M main

# 推送
git push -u origin main
```

### 步驟 3: 驗證 (輸入認證)

當看到提示時:
```
Username for 'https://github.com': [輸入你的 GitHub 用戶名]
Password for 'https://...': [輸入 personal access token]
```

**獲取 Token**:
1. 訪問 https://github.com/settings/tokens
2. 點擊 **Generate new token (classic)**
3. 勾選 `repo` 和 `workflow`
4. 生成並複製 token
5. 粘貼到提示中

---

## ✅ 推送後檢查

訪問: `https://github.com/<YOUR_USERNAME>/AutoCreateForm`

驗證:
- ✅ 所有文件都在
- ✅ README.md 顯示正確
- ✅ LICENSE 包含 AI 開發信息
- ✅ 代碼能看到

---

## 🐛 常見問題排查

### 問題 1: "fatal: remote origin already exists"
```powershell
# 解決:
git remote remove origin
git remote add origin https://github.com/USERNAME/AutoCreateForm.git
```

### 問題 2: "Permission denied (publickey)"
```powershell
# 說明: 需要使用 HTTPS token 認證
# 確保:
1. 已生成 GitHub Personal Access Token
2. 使用 token 而不是密碼
```

### 問題 3: "The repository does not exist"
```powershell
# 說明: GitHub 上還沒有創建倉庫
# 解決: 先在 GitHub 上創建倉庫
# 訪問: https://github.com/new
```

---

## 💡 推送後建議

### 1. 添加 .gitignore (已有)
✅ 已包含，無需操作

### 2. 發布 Release (可選)
```
1. 進入 GitHub 倉庫
2. 點擊 "Releases" 或 "Tags"
3. 點擊 "Create a new release"
4. Tag: v2.1.0
5. Title: Release v2.1.0
6. 點擊 "Publish release"
```

### 3. 設置 GitHub Pages (可選)
```
1. 進入 Settings
2. Pages
3. Source: main
4. 按 Save
```

### 4. 添加徽章到 README (可選)
```markdown
[![GitHub stars](https://img.shields.io/github/stars/USERNAME/AutoCreateForm)](https://github.com/USERNAME/AutoCreateForm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

---

## 🎁 推送完成！

```
✅ 項目已在 GitHub 上
✅ 代碼已備份
✅ 可開源分享
✅ 可接受 PR
✅ 可追蹤版本

https://github.com/<YOUR_USERNAME>/AutoCreateForm
```

---

*如有問題，查看: GITHUB_PUSH_GUIDE.md*
