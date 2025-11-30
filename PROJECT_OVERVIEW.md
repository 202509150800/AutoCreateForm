# 📋 AutoCreateForm 項目結構總覽

## 📂 目錄結構

```
AutoCreateForm/
│
├── 📄 package.json              # Node.js 依賴配置
├── 📄 README.md                 # 完整文檔
├── 📄 QUICKSTART.md             # 快速開始指南
├── 📄 .gitignore                # Git 忽略文件列表
│
├── 📁 public/                   # 前端文件 (靜態資源)
│   ├── index.html               # 主頁面 - 4步驟 GUI
│   ├── style.css                # 樣式表 - 現代化設計
│   └── script.js                # 前端邏輯 - 文件上傳/處理
│
├── 📁 server/                   # 後端文件
│   └── app.js                   # Express 伺服器主檔案
│
├── 📁 uploads/                  # 臨時上傳目錄 (自動建立)
├── 📁 output/                   # 生成檔案輸出目錄 (自動建立)
└── 📁 temp/                     # 臨時文件目錄 (自動建立)
```

## 🚀 快速開始

### 安裝
```bash
npm install
```

### 運行
```bash
npm start
```

### 開發模式（需要 nodemon）
```bash
npm run dev
```

---

## 🔧 技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| **Node.js** | 14+ | 伺服器運行環境 |
| **Express** | 4.18.2 | Web 框架 |
| **Multer** | 1.4.5 | 文件上傳 |
| **XLSX** | 0.18.5 | Excel 讀取 |
| **JSZip** | 3.10.1 | Word (.docx) 處理 |
| **Archiver** | 6.0.1 | ZIP 打包 |

---

## 💡 工作流程

```
1️⃣ 下載 Excel 範本
   └─ 使用者填寫資料

2️⃣ 上傳 Excel 檔案
   └─ 伺服器解析資料

3️⃣ 上傳 Word 範本
   └─ 範本包含佔位符：{{欄位名稱}}

4️⃣ 開始生成
   └─ 為每條 Excel 記錄生成獨立文件
       ├─ Word 檔案 (ID.docx)
       └─ PDF 檔案 (ID.pdf)

5️⃣ 下載結果
   └─ ZIP 包中包含所有生成文件
```

---

## 🎯 核心功能

### 前端 (public/script.js)
- ✅ Excel 範本下載
- ✅ 拖拽上傳支持
- ✅ 實時進度顯示
- ✅ ZIP 檔案下載

### 後端 (server/app.js)
- ✅ Excel 解析 (支持 .xlsx/.xls)
- ✅ Word 佔位符替換
- ✅ PDF 轉換 (透過 LibreOffice)
- ✅ 批量文件生成

---

## 📝 使用示例

### Excel 資料格式

| ID | 姓名 | 電話 | 地址 | 備註 |
|----|------|------|------|------|
| 1 | 張三 | 0912345678 | 台北市 | 範例 |
| 2 | 李四 | 0987654321 | 台中市 | 範例 |

### Word 範本格式

```
姓名：{{姓名}}
電話：{{電話}}
地址：{{地址}}
備註：{{備註}}
```

### 生成結果

```
output/
├── 1.docx       ← ID=1 的 Word 檔案
├── 1.pdf        ← ID=1 的 PDF 檔案
├── 2.docx       ← ID=2 的 Word 檔案
├── 2.pdf        ← ID=2 的 PDF 檔案
└── ...
```

---

## 🔑 關鍵特性

| 特性 | 說明 |
|------|------|
| **ID-Based Naming** | 檔案名稱根據 Excel ID 欄位自動生成 |
| **Batch Processing** | 一次可處理多筆記錄 |
| **Template Reuse** | Word 範本可重複使用 |
| **Error Handling** | 詳細的錯誤日誌記錄 |
| **GUI Friendly** | 無需命令行，純 Web 介面 |

---

## 🛠️ 配置選項

### 修改埠號
編輯 `server/app.js`：
```javascript
const PORT = process.env.PORT || 3000;  // 改為你的埠號
```

### 增加上傳限制
編輯 `server/app.js`：
```javascript
limits: { fileSize: 50 * 1024 * 1024 }  // 修改大小限制
```

---

## ❓ 常見問題

**Q: PDF 轉換失敗？**
- 需要安裝 LibreOffice
- Windows: `choco install libreoffice`

**Q: 佔位符未被替換？**
- 檢查格式是否為 `{{欄位名稱}}`
- 確認欄位名稱與 Excel 完全相同

**Q: Excel 無法識別？**
- 確保格式為 .xlsx 或 .xls
- 檢查是否包含 ID 欄位

---

## 📦 依賴清單

```json
{
  "dependencies": {
    "express": "Express.js 網頁框架",
    "multer": "檔案上傳中間件",
    "xlsx": "Excel 檔案解析",
    "jszip": "ZIP/DOCX 檔案處理",
    "archiver": "建立 ZIP 壓縮檔"
  }
}
```

---

## 🔒 安全性說明

- 所有上傳檔案存儲在臨時目錄
- 生成的檔案可被下載後自動清理
- 支持文件大小限制（預設 50MB）

---

## 📊 生成流程圖

```
用戶界面
   ↓
上傳 Excel & Word
   ↓
伺服器接收檔案
   ↓
解析 Excel 數據 (XLSX → JSON)
   ↓
讀取 Word 範本 (DOCX → ZIP → XML)
   ↓
替換佔位符 {{key}} → value
   ↓
保存新 Word 檔案
   ↓
轉換為 PDF (LibreOffice)
   ↓
建立 ZIP 壓縮檔
   ↓
用戶下載
```

---

## 💻 系統需求

- **作業系統**: Windows / macOS / Linux
- **Node.js**: 14.0+
- **NPM**: 6.0+
- **瀏覽器**: Chrome / Firefox / Edge (任何現代瀏覽器)
- **LibreOffice** (PDF 轉換時需要)

---

## 📄 許可證

ISC License

---

## 🙏 致謝

感謝所有開源依賴項目！

---

**最後更新**: 2025-11-30
