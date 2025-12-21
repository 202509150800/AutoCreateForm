# AutoCreateForm - 最佳實踐指南

## 📚 目錄

1. [項目架構](#項目架構)
2. [開發最佳實踐](#開發最佳實踐)
3. [部署和配置](#部署和配置)
4. [故障排除](#故障排除)
5. [性能優化](#性能優化)
6. [安全考慮](#安全考慮)

---

## 項目架構

### 目錄結構

```
AutoCreateForm/
├── server/
│   ├── app.js                 # Express 主應用
│   └── utils/
│       ├── csvParser.js       # CSV 解析工具
│       ├── wordGenerator.js   # Word 文檔生成
│       └── pdfConverter.js    # PDF 轉換工具
├── public/
│   ├── index.html            # 主頁面
│   ├── script.js             # 前端邏輯
│   └── style.css             # 樣式
├── uploads/                  # 上傳的臨時文件
├── output/                   # 生成的文檔
├── temp/                     # 臨時文件
├── package.json              # 項目依賴
└── README.md                 # 項目說明
```

### 模塊化設計

```javascript
// server/utils/csvParser.js
├── parseCSVLine()      // 單行 CSV 解析
└── parseCSVContent()   // 完整 CSV 文件解析

// server/utils/wordGenerator.js
├── createFlexibleRegex()      // 正則表達式生成
├── replacePlaceholders()      // 占位符替換
└── generateWordDocument()     // Word 文檔生成

// server/utils/pdfConverter.js
├── isLibreOfficeAvailable()   // 檢查 LibreOffice
└── convertWordToPDF()         // Word 轉 PDF
```

---

## 開發最佳實踐

### 1. 佔位符設計

#### ✅ 推薦格式

```word
設備 ID: {{ID}}
型號: {{Model}}
MAC 地址: {{MAC}}
```

#### ✅ 為什麼使用 `{{KEY}}`

- **避免歧義**: 不會與 Word 的內部代碼衝突
- **安全性**: 減少意外替換風險
- **可讀性**: 清晰地表明這是占位符

#### ❌ 避免的做法

```word
❌ 單大括號: {ID}  (容易與其他格式混淆)
❌ 無括號: ID     (會替換所有 ID 出現)
❌ 複雜格式: {{ ID }}  (可能導致匹配失敗)
```

### 2. Word 模板準備

#### 創建模板的步驟

1. **打開 Word 並建立表格**
   ```
   | 欄位 | 內容 |
   |------|------|
   | 設備 ID | {{ID}} |
   | 型號 | {{Model}} |
   ```

2. **避免對占位符進行格式化**
   - ❌ 不要對 `{{ID}}` 應用粗體或斜體
   - ❌ 不要使用自動換行分割占位符
   - ✅ 保持占位符為純文本

3. **保存為 .docx 格式**
   - 必須使用 .docx（新格式）
   - 不支持 .doc（舊格式）

#### 模板驗證

檢查模板是否包含所有所需的占位符：

```javascript
// 使用 inspect_docx.js 檢查
node inspect_docx.js
```

### 3. Excel/CSV 數據準備

#### Excel 格式要求

```
| ID | Name | Email | Phone |
|----|------|-------|-------|
| 1 | 張三 | abc@example.com | 13800138000 |
| 2 | 李四 | def@example.com | 13900139000 |
```

#### CSV 格式要求

```csv
"ID","Name","Email","Phone"
"1","張三","abc@example.com","13800138000"
"2","李四","def@example.com","13900139000"
```

#### ✅ 最佳實踐

- ID 欄位必須存在且不能為空
- 所有欄位名稱區分大小寫
- 欄位名稱必須與 Word 模板中的占位符完全匹配
- 避免在數據中使用特殊字符（如 $ % 等）

### 4. 字段定義

#### 正確的字段定義順序

1. **首先定義 ID 字段**（自動添加）
2. **批量添加其他字段**（推薦方式）

```
批量輸入: ID, Name, Email, Phone, Department
```

3. **或逐個添加**（用於修改）

#### ✅ 字段名稱規則

- 必須與 Excel 列名完全一致（區分大小寫）
- 使用英文、數字和下劃線
- 避免使用空格或特殊字符

---

## 部署和配置

### 1. 環境準備

#### 最小要求

```
Node.js: 14.0+ (推薦 16.0+)
npm: 6.0+
內存: 512MB+
磁盤空間: 1GB+
```

#### 可選組件

```
LibreOffice: 用於 PDF 生成（推薦）
Python: 用於某些工具腳本
```

### 2. 安裝步驟

```bash
# 1. 克隆或下載項目
git clone <repo>
cd AutoCreateForm

# 2. 安裝依賴
npm install

# 3. 啟動服務器
npm start

# 4. 打開瀏覽器
# 訪問 http://localhost:3000
```

### 3. LibreOffice 配置（Windows）

#### 安裝 LibreOffice

1. 下載: https://www.libreoffice.org/download/
2. 執行安裝程序
3. 選擇安裝路徑（默認: `C:\Program Files\LibreOffice`)
4. 完成安裝

#### 驗證安裝

```bash
# 檢查 LibreOffice 版本
soffice --version

# 如果輸出版本號，表示安裝成功
# LibreOffice 7.2.0
```

### 4. 文件清理政策

#### 自動清理

- 上傳的文件在處理後立即刪除
- 臨時文件在生成完成後清理

#### 手動清理

```bash
# 清理上傳目錄
rm uploads/*

# 清理輸出目錄
rm output/*

# 清理臨時文件
rm temp/*
```

---

## 故障排除

### 問題 1: 占位符未被替換

#### 症狀
```
✗ {{ID}} → 未找到占位符
✗ {{Model}} → 未找到占位符
```

#### 診斷步驟

1. **檢查模板內容**
   ```bash
   node inspect_docx.js
   ```
   查看輸出中的 "Snippet containing "{"

2. **驗證占位符格式**
   - Word 中應該顯示: `{{ID}}`
   - 不是: `{ID}` 或其他格式

3. **檢查 Excel 字段名稱**
   - 確保 Excel 中的列名與占位符完全相同
   - 區分大小寫
   - 沒有多餘空格

#### 解決方案

```
1. 在 Word 模板中重新輸入占位符
   （確保是純文本，不帶格式化）

2. 驗證 Excel 列名：
   - ID, Model, MAC 等

3. 重新上傳文件並重試

4. 如果仍不行，檢查日誌輸出中的：
   "CSV Headers after cleaning"
   "Excel 欄位名稱"
```

### 問題 2: CSV 解析失敗

#### 症狀
```
❌ CSV 檔案無資料
或
❌ CSV 檔案解析失敗
```

#### 原因和解決

| 原因 | 解決方案 |
|------|---------|
| BOM 標記 | Excel 存儲時選擇 "UTF-8 with BOM" |
| 編碼問題 | 使用 UTF-8 編碼保存 CSV |
| 格式不正確 | 確保第一行是標題，數據從第二行開始 |
| 引號問題 | 使用雙引號圍繞包含逗號的值 |

#### CSV 修復工具

```bash
# 使用 PowerShell 腳本修復 CSV
.\tools\MergeToExcel.ps1 -InputFolder ".\output" -OutputFile ".\fixed.csv"
```

### 問題 3: PDF 生成失敗

#### 症狀
```
⚠️ LibreOffice not available, skipping PDF conversion
或
⚠️ PDF conversion failed: soffice not found
```

#### 解決步驟

1. **檢查 LibreOffice 是否安裝**
   ```bash
   soffice --version
   ```

2. **重新安裝 LibreOffice**
   - 下載 Windows 版本
   - 完全卸載舊版本
   - 重新安裝

3. **配置路徑**
   - 確保 `C:\Program Files\LibreOffice\program` 在系統 PATH 中
   - 或在 app.js 中修改路徑

4. **禁用 PDF 生成**
   - 如果不需要 PDF，在前端界面取消選擇 "生成 PDF"

### 問題 4: 服務器啟動失敗

#### 症狀
```
❌ Error: listen EADDRINUSE :::3000
```

#### 原因

端口 3000 已被佔用

#### 解決方案

```bash
# 方案 1: 修改端口（在 server/app.js 中）
const PORT = process.env.PORT || 3001;

# 方案 2: 殺死佔用端口的進程
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

---

## 性能優化

### 1. 大批量數據處理

#### 問題
處理超過 1000 條記錄時，內存使用增加

#### 解決方案

```javascript
// 分批處理而不是一次性全部加載
const BATCH_SIZE = 100;

for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    await processBatch(batch);
    
    // 每批處理後清理內存
    if (global.gc) global.gc();
}
```

#### 啟動時啟用垃圾回收

```bash
node --expose-gc server/app.js
```

### 2. 文件上傳大小限制

#### 配置上限

```javascript
// server/app.js
const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }  // 50MB
});
```

#### 調整建議

```
小文件（< 5MB）: 推薦設置
中等文件（5-50MB）: 可以接受
大文件（> 50MB）: 需要優化或分割
```

### 3. 模板緩存

#### 當前實現
每次都重新讀取和解析 Word 模板

#### 優化建議

```javascript
// 添加模板緩存
const templateCache = new Map();

function getTemplate(templatePath) {
    if (!templateCache.has(templatePath)) {
        const content = fs.readFileSync(templatePath);
        templateCache.set(templatePath, content);
    }
    return templateCache.get(templatePath);
}
```

---

## 安全考慮

### 1. 文件驗證

#### 已實現
```javascript
// 檢查文件類型
if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx')) {
    // 拒絕
}

// 限制文件大小
limits: { fileSize: 50 * 1024 * 1024 }
```

#### 建議加強

```javascript
// 驗證 MIME 類型
const ALLOWED_MIME = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
];

// 驗證文件內容
const fileType = require('file-type');
const type = await fileType.fromBuffer(buffer);
```

### 2. 輸入驗證

#### Excel/CSV 數據清理

```javascript
// 移除潛在危險的值
function sanitizeData(data) {
    return data.map(row => {
        const sanitized = {};
        Object.keys(row).forEach(key => {
            // 移除 HTML/JS
            sanitized[key] = String(row[key])
                .replace(/<[^>]*>/g, '')
                .replace(/javascript:/gi, '')
                .trim();
        });
        return sanitized;
    });
}
```

### 3. 臨時文件安全

#### 實現原則

```javascript
// ✅ 立即刪除臨時文件
try {
    fs.unlinkSync(excelPath);
    fs.unlinkSync(wordPath);
} catch (e) {
    // 記錄但不中斷
    console.warn('Cleanup failed:', e.message);
}

// ✅ 使用唯一的臨時文件名
filename: `${Date.now()}-${randomString()}-${originalname}`

// ✅ 定期清理舊文件
setInterval(() => {
    const files = fs.readdirSync(uploadDir);
    const now = Date.now();
    files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        const stat = fs.statSync(filePath);
        if (now - stat.mtimeMs > 24 * 60 * 60 * 1000) {
            fs.unlinkSync(filePath); // 刪除超過 24 小時的文件
        }
    });
}, 60 * 60 * 1000); // 每小時檢查一次
```

### 4. API 速率限制

#### 實現

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分鐘
    max: 100 // 限制 100 個請求
});

app.post('/api/generate', limiter, upload.fields(...), async (req, res) => {
    // ...
});
```

### 5. 內容安全策略

#### 設置 CSP 頭

```javascript
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'"
    ].join('; '));
    next();
});
```

---

## 總結清單

### 部署前檢查

- [ ] Node.js 和 npm 已安裝
- [ ] 所有依賴已安裝 (`npm install`)
- [ ] LibreOffice 已安裝（用於 PDF）
- [ ] 測試占位符替換功能
- [ ] 驗證 Excel 和 CSV 解析
- [ ] 配置文件路徑和權限
- [ ] 測試臨時文件清理

### 使用前檢查

- [ ] Word 模板使用 `{{KEY}}` 格式
- [ ] Excel/CSV 包含 ID 列
- [ ] 所有字段名稱匹配
- [ ] 文件已上傳且未損壞
- [ ] 至少選擇一個生成選項
- [ ] 檢查服務器日誌中的錯誤

### 優化建議

- [ ] 實現模板緩存
- [ ] 添加請求速率限制
- [ ] 使用數據庫記錄操作歷史
- [ ] 實現用戶認證和授權
- [ ] 監控磁盤空間使用
- [ ] 定期備份生成的文件

