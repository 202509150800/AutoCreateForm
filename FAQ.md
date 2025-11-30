# 前檢查清單與常見問題解答

## 🔍 啟動前檢查清單

在第一次運行前，請確保您已完成以下步驟：

### 系統環境
- [ ] Node.js 已安裝 (v14.0+)
- [ ] npm 已安裝 (v6.0+)
- [ ] 已驗證版本: `node --version` 和 `npm --version`

### 項目設置
- [ ] 已進入項目目錄
- [ ] 已執行 `npm install`
- [ ] 所有依賴已成功安裝 (node_modules 資料夾存在)

### 依賴核對
- [ ] package.json 存在
- [ ] server/app.js 存在
- [ ] public/index.html 存在
- [ ] public/style.css 存在
- [ ] public/script.js 存在

### 系統要求
- [ ] 硬盤至少有 1GB 可用空間
- [ ] 網路連接正常
- [ ] 埠 3000 未被占用 (可選：測試 `netstat -ano | findstr :3000`)

---

## ❓ 常見問題速查

### 1️⃣ 如何安裝 Node.js？

**Windows:**
1. 訪問 https://nodejs.org
2. 下載 LTS 版本 (推薦 18.x 或 20.x)
3. 執行安裝程序
4. 一路 Next 完成安裝

**驗證安裝:**
```bash
node --version
npm --version
```

### 2️⃣ npm install 失敗怎麼辦？

**常見原因和解決方案:**

**原因A: 網路問題**
```bash
# 清除 npm 快取
npm cache clean --force

# 重新安裝
npm install
```

**原因B: 權限問題 (Windows)**
- 用管理員身份打開命令提示符
- 重新執行 `npm install`

**原因C: 版本不匹配**
```bash
# 更新 npm
npm install -g npm@latest

# 重新安裝依賴
npm install
```

### 3️⃣ 應用啟動不了？

**檢查步驟:**
```bash
# 1. 確認在正確的目錄
cd "c:\Users\fung\Desktop\2025\test\AutoCreateForm"

# 2. 嘗試啟動
npm start

# 3. 如果仍無法啟動，檢查端口
# Windows:
netstat -ano | findstr :3000

# 如果端口被占用，改用其他端口或停止占用進程
```

### 4️⃣ 埠 3000 被占用怎麼辦？

**方案 A: 使用不同埠號**
```bash
# macOS/Linux
PORT=8080 npm start

# Windows PowerShell
$env:PORT=8080; npm start

# Windows CMD
set PORT=8080 && npm start
```

**方案 B: 找出占用進程並停止**
```bash
# Windows - 查找占用 3000 埠的進程
netstat -ano | findstr :3000

# 找到 PID 後停止進程
taskkill /PID <PID> /F
```

### 5️⃣ Excel 範本怎麼製作？

**簡單步驟:**
1. 用 Excel 或 Google Sheets 打開
2. 在第一行填寫欄位名稱
   - ID (必須)
   - 其他欄位自訂 (如: 姓名, 電話等)
3. 從第二行開始填寫資料
4. 保存為 .xlsx 格式

**範例:**
```
ID | 姓名 | 電話
1  | 張三 | 09123456
2  | 李四 | 09876543
```

### 6️⃣ Word 範本怎麼製作？

**簡單步驟:**
1. 用 Word 新建文檔
2. 設計您的表格/文檔格式
3. **在要填寫的地方輸入佔位符:** `{欄位名稱}`
4. 保存為 .docx 格式 (重要！)

**範例:**
```
姓名: {姓名}
電話: {電話}
```

**重要提示:**
- ❌ 不要保存為 .doc (舊格式)
- ❌ 佔位符名稱不要有空格
- ✅ 必須完全匹配 Excel 欄位名稱

### 7️⃣ PDF 不能生成？

**需要 LibreOffice:**

**Windows (用 Chocolatey):**
```powershell
# 以管理員打開 PowerShell，執行:
choco install libreoffice
```

**Windows (手動下載):**
1. https://www.libreoffice.org/download
2. 下載並安裝 Windows 版本
3. 重啟應用

**macOS:**
```bash
brew install libreoffice
```

**Linux (Ubuntu):**
```bash
sudo apt-get install libreoffice
```

### 8️⃣ 檔案上傳失敗？

**排查步驟:**

1. **檢查檔案類型**
   - Excel: 必須是 .xlsx 或 .xls
   - Word: 必須是 .docx
   - 不要用舊格式 (.xls, .doc)

2. **檢查檔案大小**
   - 預設限制: 50MB
   - 如需更大檔案，編輯 server/app.js

3. **檢查 Excel 內容**
   - 必須有 "ID" 欄位
   - 必須至少有一行資料
   - ID 欄位不能為空

4. **檢查 Word 內容**
   - 確保是有效的 .docx 檔案
   - 可以用 Word 打開並重新保存

### 9️⃣ 佔位符沒被替換？

**常見原因:**

| 問題 | 原因 | 解決 |
|------|------|------|
| `{姓名}` 沒變成 "張三" | 欄位名稱不匹配 | 檢查 Excel 中是否有 "姓名" 欄位 |
| 格式不對 | 使用了 `{姓名}` 或 `[姓名]` | 必須用 `{姓名}` |
| 有空格 | `{ 姓名 }` | 不要在 `{}` 內加空格 |
| 大小寫不同 | `{SHENGMING}` vs `{姓名}` | 完全相同即可 (中文不區分) |

### 🔟 檢查生成是否成功？

**步驟:**
1. 完成生成後查看結果頁面摘要
2. 應顯示類似: `成功生成 10 個檔案: 5 個 Word 檔案, 5 個 PDF 檔案`
3. 點擊「下載全部檔案 (ZIP)」
4. 解壓縮並檢查檔案內容

**檢查清單:**
- ✅ 檔案數量是否正確？
- ✅ ID 是否匹配 Excel 中的 ID？
- ✅ 資料是否正確替換？
- ✅ 格式是否保留？

---

## 🚀 快速啟動指令

**全部步驟一起執行:**

```bash
# 1. 進入目錄
cd "c:\Users\fung\Desktop\2025\test\AutoCreateForm"

# 2. 安裝依賴
npm install

# 3. 啟動應用
npm start

# 4. 在瀏覽器中打開
# http://localhost:3000
```

**開發模式 (自動重啟):**
```bash
npm run dev
```

**停止應用:**
```
按 Ctrl + C
```

---

## 📝 檔案清單

**必須存在的檔案:**
```
✓ package.json
✓ server/app.js
✓ public/index.html
✓ public/style.css
✓ public/script.js
```

**自動建立的目錄:**
```
✓ node_modules/
✓ uploads/
✓ output/
✓ temp/
```

---

## 💡 最佳實踐

### 資料準備
- ✅ 在 Excel 中使用一致的資料格式
- ✅ 避免在 ID 中使用特殊字符
- ✅ 確保所有必要欄位都有資料

### 範本設計
- ✅ 使用簡化的 Word 格式
- ✅ 測試佔位符是否正確
- ✅ 保留足夠的空間供文本填寫

### 生成流程
- ✅ 先生成 Word，後生成 PDF (更穩定)
- ✅ 確保 LibreOffice 已安裝 (PDF 轉換用)
- ✅ 檔案數量不超過 500 個 (性能考慮)

---

## 🆘 緊急求助

遇到以下情況時:

1. **檢查終端/命令列輸出**
   - 是否有紅色錯誤信息？
   - 記下完整的錯誤信息

2. **打開瀏覽器開發者工具**
   - F12 → Console 標籤
   - 記下紅色錯誤

3. **檢查 README.md 的故障排除部分**
   - 可能已有解決方案

4. **嘗試以下步驟**
   - 關閉應用 (Ctrl + C)
   - 清除緩存 (刪除 node_modules，重新 npm install)
   - 重新啟動應用

---

## ✅ 驗證安裝成功的標誌

看到以下訊息表示安裝成功:

```
✓ 伺服器運行在 http://localhost:3000
✓ 打開瀏覽器訪問: http://localhost:3000
```

然後:
1. 打開 http://localhost:3000
2. 應看到頁面標題「📋 批量表格生成工具」
3. 頁面應清晰可見，四個步驟區域完整

---

## 🎓 進階主題

### 自訂埠號
編輯 `server/app.js` 第 11 行

### 自訂上傳限制
編輯 `server/app.js` 第 30-33 行

### 添加新功能
- 編輯前端: `public/` 目錄下檔案
- 編輯後端: `server/app.js`
- 編輯樣式: `public/style.css`

---

**最後更新:** 2025-11-30

祝您使用愉快！如有問題，參考 README.md 和 TUTORIAL.md 🎉
