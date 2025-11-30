# 常見問題 FAQ

## 🔍 啟動問題

### 應用無法啟動？
```bash
# 確認在正確目錄
cd "c:\Users\fung\Desktop\2025\test\AutoCreateForm"

# 重新安裝依賴
npm install

# 啟動應用
npm start
```

### 埠 3000 被占用？
```powershell
# 方案 A：使用不同埠
$env:PORT=8080; npm start

# 方案 B：找出占用進程
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 📁 檔案問題

### Excel 怎麼準備？
1. 用 Excel 新建檔案
2. 第一行填寫欄位名稱（必須包含 ID）
3. 第二行開始填寫資料
4. 儲存為 `.xlsx` 格式

**範例：**
```
ID | 姓名 | 電話
1  | 張三 | 09123456
2  | 李四 | 09876543
```

### Word 範本怎麼製作？
1. 用 Word 新建文檔
2. 設計您的表格/文檔格式
3. 在要填寫的地方輸入佔位符：`{欄位名稱}`
4. 儲存為 `.docx` 格式

**範例：**
```
姓名：{姓名}
電話：{電話}
```

### 佔位符沒被替換？

| 問題 | 原因 | 解決 |
|------|------|------|
| `{姓名}` 沒變 | 欄位名稱不匹配 | 檢查 Excel 欄位名稱 |
| 格式不對 | 使用了 `{{姓名}}` | 改用單括號 `{姓名}` |
| 有空格 | `{ 姓名 }` | 不要加空格 |

## 🖨️ PDF 問題

### PDF 不能生成？

需要安裝 LibreOffice：
1. 訪問：https://www.libreoffice.org/download/download/
2. 下載 Windows 版本
3. 執行安裝程序
4. 重啟應用

**注意：** 如果不需要 PDF，可以只生成 Word 檔案。

## ✅ 驗證安裝成功

看到以下訊息表示成功：
```
✓ 伺服器運行在 http://localhost:3000
✓ 打開瀏覽器訪問: http://localhost:3000
```

## 📝 必須存在的檔案

```
✓ package.json
✓ server/app.js
✓ public/index.html
✓ public/style.css
✓ public/script.js
```

## 💡 最佳實踐

- ✅ 使用簡單的欄位名稱（避免特殊字符）
- ✅ 確保 Excel 欄位與定義的欄位完全相同
- ✅ 先測試小量資料，確認無誤後再批量生成
- ✅ 儲存為 `.xlsx` 格式（不是 `.xls`）

---

**最後更新：** 2025-11-30
