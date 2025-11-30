# 批量表格生成工具

一個簡單易用的 Web 應用，可根據 Excel 資料自動填寫 Word 範本，並批量生成 Word 和 PDF 檔案。

## 功能特性

✨ **主要功能：**
- 📥 下載 Excel 範本並填寫資料
- 📄 上傳 Word 表格範本
- 🚀 根據 Excel 資料自動填寫 Word 表格
- 📑 批量生成 PDF 檔案
- 📦 打包所有生成的檔案為 ZIP

✅ **特點：**
- 直觀的圖形使用者介面 (GUI)
- 支援拖拽上傳檔案
- 根據 Excel 中的 ID 欄位自動命名檔案
- 實時進度顯示
- 一鍵下載所有生成檔案

## 系統需求

- **Node.js** 14.0 或更高版本
- **npm** 6.0 或更高版本
- **LibreOffice** (用於 PDF 轉換，可選)

## 安裝步驟

### 1. 安裝 Node.js 依賴
```bash
npm install
```

### 2. 啟動應用
```bash
npm start
```

應用將在 `http://localhost:3000` 啟動

### 3. 開發模式 (可選)
如果已安裝 nodemon：
```bash
npm run dev
```

## 使用方法

### 第一步：下載 Excel 範本
1. 點擊「下載 Excel 範本」按鈕
2. 打開下載的 CSV/Excel 檔案
3. 在範本中填寫您的資料

**Excel 範本格式：**
```
ID    | 姓名 | 電話      | 地址        | 備註
------|------|-----------|-------------|-------
1     | 張三 | 0912345678| 台北市信義區| 範例
2     | 李四 | 0987654321| 台中市西屯區| 範例
```

**重要：** 必須包含 `ID` 欄位，每筆記錄將根據 ID 生成單獨的檔案。

### 第二步：上傳 Excel 資料
1. 點擊 Excel 上傳區域或拖拽檔案
2. 確認檔案已選擇

### 第三步：上傳 Word 範本
1. 準備一個 `.docx` 格式的 Word 範本
2. **在範本中使用佔位符標記要填寫的位置：** `{欄位名稱}`

**Word 範本範例：**
```
姓名：{姓名}
電話：{電話}
地址：{地址}
備註：{備註}
```

3. 點擊 Word 上傳區域或拖拽檔案上傳

### 第四步：設置與生成
1. 勾選要生成的檔案類型：
   - ☑ 生成 Word 檔案
   - ☑ 生成 PDF 檔案
2. 點擊「開始生成」按鈕

### 第五步：下載結果
- 等待生成完成
- 點擊「下載全部檔案 (ZIP)」下載所有生成的檔案

## 檔案結構

```
AutoCreateForm/
├── public/                 # 前端文件
│   ├── index.html         # HTML 頁面
│   ├── style.css          # 樣式
│   └── script.js          # 前端 JavaScript
├── server/                # 後端文件
│   └── app.js             # Express 應用主檔案
├── uploads/               # 上傳檔案臨時存儲位置
├── output/                # 生成的檔案輸出位置
├── package.json           # Node.js 依賴配置
└── README.md              # 本檔案
```

## 佔位符語法

在 Word 範本中，使用以下語法標記要替換的內容：

```
基本語法：{欄位名稱}

範例：
- {姓名}      → 會被替換為 Excel 中「姓名」欄位的值
- {電話}      → 會被替換為 Excel 中「電話」欄位的值
- {地址}      → 會被替換為 Excel 中「地址」欄位的值
```

**注意：** 佔位符名稱必須與 Excel 的欄位名稱完全相同（區分大小寫）。

## 生成的檔案

根據設置，將生成以下檔案：

```
output/
├── 1.docx         # 根據 ID=1 生成的 Word 檔案
├── 1.pdf          # 根據 ID=1 生成的 PDF 檔案
├── 2.docx         # 根據 ID=2 生成的 Word 檔案
├── 2.pdf          # 根據 ID=2 生成的 PDF 檔案
└── ...
```

每個檔案名稱對應 Excel 中的 ID 值。

## 故障排除

### 問題 1：無法啟動伺服器
**解決方案：**
- 確保 Node.js 已正確安裝
- 檢查埠 3000 是否被占用
- 嘗試使用不同埠：修改 `app.js` 中的 `PORT` 變數

### 問題 2：PDF 生成失敗
**解決方案：**
- 安裝 LibreOffice：`choco install libreoffice` (Windows)
- 或通過 Microsoft Office 將 Word 轉換為 PDF
- 可選只生成 Word 檔案

### 問題 3：佔位符未被替換
**解決方案：**
- 檢查 Word 範本中的佔位符是否使用 `{}` 格式
- 確保佔位符名稱與 Excel 欄位名稱完全相同
- Excel 欄位名稱不要有多餘空格

### 問題 4：Excel 檔案上傳失敗
**解決方案：**
- 確保 Excel 檔案格式為 `.xlsx` 或 `.xls`
- 檢查 Excel 是否包含「ID」欄位
- 嘗試用別的應用程式打開並重新保存 Excel 檔案

## 進階設置

### 修改埠號
編輯 `server/app.js`，找到以下行：
```javascript
const PORT = 3000;
```
改為您想要的埠號。

### 增加檔案大小限制
編輯 `server/app.js`，修改 multer 配置：
```javascript
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
```

## 支持的檔案格式

- **Excel：** `.xlsx`, `.xls`, `.csv`
- **Word：** `.docx` (不支持 `.doc`)
- **PDF：** 由 Word 轉換生成

## 常見問題

**Q: 支持多個工作表嗎？**  
A: 目前只支持單一工作表。應用會讀取第一個工作表的資料。

**Q: 可以自訂生成的檔案格式嗎？**  
A: 可以。修改 Word 範本的格式和佈局，生成的檔案會保持相同的格式。

**Q: 支持合併儲存格嗎？**  
A: 支持。Word 範本中的任何有效格式都會被保留。

**Q: 是否支持圖片和表格替換？**  
A: 目前主要支持文字替換。複雜內容替換需要額外開發。

## 版本歷史

### v1.0.0 (2025-11-30)
- 初始版本發佈
- 基礎的 Excel 到 Word 轉換功能
- PDF 生成支持
- Web GUI 介面

## 許可證

本專案採用 ISC 許可證。

## 技術棧

- **前端：** HTML5, CSS3, Vanilla JavaScript
- **後端：** Node.js, Express.js
- **資料處理：** XLSX (Excel), docx (Word)
- **PDF 轉換：** LibreOffice/docx-pdf
- **文件壓縮：** Archiver

## 聯絡與支持

如有問題或建議，請通過以下方式聯絡：

- 提交 Issue
- 提交 Pull Request

## 致謝

感謝所有開源依賴項目的貢獻者。
