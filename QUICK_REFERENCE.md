# AutoCreateForm - 快速參考指南

## 📋 文檔導航表

### 🎯 根據您的需求選擇相應的文檔

| 我想... | 查看文檔 | 說明 |
|--------|--------|------|
| **快速開始** | [QUICKSTART.md](QUICKSTART.md) | 5 分鐘快速開始 |
| **了解項目** | [README.md](README.md) | 項目介紹和特性 |
| **使用 API** | [API_REFERENCE.md](API_REFERENCE.md) | 完整 API 文檔 |
| **深入學習** | [BEST_PRACTICES.md](BEST_PRACTICES.md) | 800+ 行最佳實踐 |
| **解決問題** | [BEST_PRACTICES.md#故障排除](BEST_PRACTICES.md) | 故障排除指南 |
| **看常見問題** | [FAQ.md](FAQ.md) | 常見問題解答 |
| **啟動配置** | [STARTUP.md](STARTUP.md) | 詳細啟動指南 |
| **使用 CSV** | [CSV_INTEGRATION_GUIDE.md](CSV_INTEGRATION_GUIDE.md) | CSV 集成說明 |
| **查看進度** | [PROJECT_COMPLETION_REPORT.md](PROJECT_COMPLETION_REPORT.md) | 項目完成報告 |
| **檢查清單** | [COMPLETION_CHECKLIST.md](COMPLETION_CHECKLIST.md) | 完成度驗證 |

---

## 🚀 3 分鐘快速開始

### 1️⃣ 啟動服務器
```bash
npm install
npm start
```

✅ 看到 `✓ 伺服器運行在 http://localhost:3000` 說明成功

### 2️⃣ 打開瀏覽器
訪問: **http://localhost:3000**

### 3️⃣ 準備數據
#### Excel/CSV 格式:
```csv
ID,Name,Email,Phone
L001,張三,zs@example.com,13800138000
L002,李四,ls@example.com,13900139000
```

#### Word 模板:
```
設備 ID: {{ID}}
姓名: {{Name}}
郵箱: {{Email}}
電話: {{Phone}}
```

### 4️⃣ 生成文檔
1. 上傳 Excel/CSV
2. 上傳 Word 模板
3. 選擇要替換的字段
4. 點擊「生成檔案」

### 5️⃣ 下載結果
點擊「下載全部」以 ZIP 格式下載所有生成的文件

---

## 🛠️ 代碼結構速查表

### 後端代碼 (server/)
```
server/
├── app.js (251 行)
│   ├── 配置: 端口、目錄、Multer
│   ├── 中間件: Express 靜態文件、JSON
│   ├── 路由: GET /, POST /api/generate, GET /api/download-zip
│   └── 錯誤處理和服務器啟動
│
└── utils/
    ├── csvParser.js
    │   ├── parseCSVLine() - 解析 CSV 單行
    │   └── parseCSVContent() - 解析整個 CSV 文件
    │
    ├── wordGenerator.js
    │   ├── createFlexibleRegex() - 創建支持 XML 的正則
    │   ├── replacePlaceholders() - 替換占位符
    │   └── generateWordDocument() - 生成 Word 文件
    │
    └── pdfConverter.js
        ├── isLibreOfficeAvailable() - 檢查 LibreOffice
        └── convertWordToPDF() - Word 轉 PDF
```

### 前端代碼 (public/)
```
public/
├── index.html (UI 界面)
├── style.css (樣式)
└── script.js (514 行，完整文檔化)
    ├── 欄位管理 (switchInputMode, addColumn...)
    ├── 文件上傳 (handleExcelUpload, handleWordUpload...)
    ├── 數據預覽 (previewCSVData, previewExcelData)
    ├── 生成下載 (generateFiles, downloadAll)
    └── 初始化 (DOMContentLoaded)
```

---

## 📝 常用命令

### 開發
```bash
# 啟動服務器
npm start

# 運行測試
npm test

# 檢查語法
node -c server/app.js
```

### 數據測試
```bash
# 測試 CSV 解析
node testCSVParsing.js

# 測試端到端
node testE2E.js

# 驗證集成
node validateIntegration.js
```

---

## 🎯 核心概念

### 占位符格式
```
推薦: {{FieldName}}   ✅ 清晰、安全、標準
替代: {FieldName}     ⚠️ 仍然支持，但不推薦
```

### 數據流
```
1. 用戶定義字段 (columns = ['ID', 'Name', ...])
2. 上傳 Excel/CSV (包含數據)
3. 上傳 Word 模板 (包含 {{}} 占位符)
4. 服務器生成:
   - 使用 CSVParser 或 XLSX 解析數據
   - 使用 WordGenerator 替換占位符
   - (可選) 使用 PDFConverter 轉換為 PDF
5. 返回生成的文件
6. 用戶下載 ZIP
```

### 文件生成流程
```
Input Files          Processing            Output
    ↓                   ↓                    ↓
  Excel/CSV  ──→  解析數據  ──→  遍歷每行
    ↓                               ↓
  Word 模板  ──→  [替換占位符] ──→  Word 文件 (.docx)
    ↓                   ↓           ↓
   [配置]  ──→  (如果啟用)  ──→  PDF 文件 (.pdf)
                    ↓
              [使用 LibreOffice]
```

---

## 🔍 占位符替換原理

### 為什麼需要特殊處理?
```
Word XML 格式:
原始: {{ID}}
實際: <w:t>{{</w:t></w:r><w:r><w:t>ID</w:t></w:r><w:r><w:t>}}</w:t>

簡單 regex 失敗: /\{\{.*?\}\}/
↓
✗ 找不到 "{{ID}}" (文本被標籤分割)

靈活 regex 成功: /I(?:<[^>]*>)*D/
↓
✅ 找到 "ID" (允許標籤在字符之間)
```

### 解決方案
```javascript
// 創建支持 XML 的正則表達式
function createFlexibleRegex(str) {
    let pattern = '';
    for (let i = 0; i < str.length; i++) {
        pattern += char;  // 字符
        if (i < str.length - 1) {
            pattern += '(?:<[^>]*>)*';  // 允許 XML 標籤
        }
    }
    return new RegExp(pattern, 'g');
}
```

---

## ✅ 故障排除快速指南

### 問題: "都是找不到" (占位符無法替換)

**診斷步驟**:
1. 檢查 Word 模板中的占位符格式 → 應該是 `{{FieldName}}`
2. 檢查 Excel 中的列名 → 區分大小寫
3. 檢查是否有拼寫錯誤
4. 查看控制台日誌 → 應該顯示找到的占位符數量

**解決**:
```
✓ 使用 {{}} 格式 (不要用 {})
✓ 確保列名與占位符完全匹配
✓ 避免額外空格
✓ Word 模板必須是 .docx 格式
```

### 問題: CSV 無法解析

**原因和解決**:
```
原因: CSV 格式錯誤
解決: 確保:
- UTF-8 編碼
- 使用雙引號: "value"
- 逗號分隔符
- 第一行是標題
```

### 問題: PDF 轉換失敗

**原因和解決**:
```
原因: LibreOffice 未安裝
解決: 安裝 LibreOffice:
- Windows: 下載安裝文件
- Linux: apt-get install libreoffice
- macOS: brew install libreoffice
```

---

## 📊 性能指標

| 操作 | 時間 | 備註 |
|------|------|------|
| CSV 解析 (1000 行) | < 1 秒 | 單線程 JavaScript |
| Word 生成 (單個) | < 2 秒 | 取決於模板大小 |
| Word → PDF | 2-5 秒 | 使用 LibreOffice |
| 批量生成 100 個 | 3-10 分鐘 | 包括 PDF 轉換 |

**優化建議**:
- 限制一次上傳最多 1000 行
- 使用條件 PDF 生成 (大批量時)
- 考慮後台隊列處理

---

## 🔐 安全檢查清單

部署前請確保:
- [ ] 文件大小限制設置 (50 MB)
- [ ] 臨時文件定期清理
- [ ] 輸入驗證已啟用
- [ ] 錯誤信息不洩露敏感信息
- [ ] 啟用 HTTPS (生產環境)
- [ ] 配置速率限制
- [ ] 啟用 CSP 頭

詳見: [BEST_PRACTICES.md#安全考慮](BEST_PRACTICES.md)

---

## 🎓 進階主題

### 自定義占位符格式
修改 `server/utils/wordGenerator.js` 中的 `replacePlaceholders` 函數

### 支持多個工作表
修改 `server/app.js` 中的 Excel 讀取部分，循環所有工作表

### 數據庫集成
添加數據庫連接到 `server/app.js`，記錄生成歷史

### 前端框架遷移
使用 React/Vue 重寫 `public/index.html` 和 `public/script.js`

---

## 📞 獲取幫助

| 問題類型 | 資源 |
|---------|------|
| **快速問題** | [FAQ.md](FAQ.md) |
| **錯誤信息** | [BEST_PRACTICES.md#故障排除](BEST_PRACTICES.md) |
| **API 問題** | [API_REFERENCE.md](API_REFERENCE.md) |
| **配置問題** | [STARTUP.md](STARTUP.md) |
| **最佳實踐** | [BEST_PRACTICES.md](BEST_PRACTICES.md) |

---

## 🔗 重要鏈接

- **GitHub**: [如果有的話](https://github.com/...)
- **文檔根目錄**: [Documentation](.)
- **項目報告**: [PROJECT_COMPLETION_REPORT.md](PROJECT_COMPLETION_REPORT.md)
- **完成清單**: [COMPLETION_CHECKLIST.md](COMPLETION_CHECKLIST.md)

---

## 📱 版本信息

- **當前版本**: v2.1.0
- **最後更新**: 2025-01-01
- **Node.js 版本**: >= 12.0.0
- **依賴項**: express, multer, xlsx, jszip, archiver

更多信息見 `package.json`

---

## 💡 常用代碼片段

### JavaScript - 調用 API
```javascript
const formData = new FormData();
formData.append('excelFile', excelFile);
formData.append('wordFile', wordFile);
formData.append('columns', JSON.stringify(['ID', 'Name', 'Email']));
formData.append('generateWord', true);
formData.append('generatePDF', true);

const response = await fetch('/api/generate', {
    method: 'POST',
    body: formData
});

const result = await response.json();
console.log(`成功生成 ${result.wordCount} 個文件`);
```

### cURL - 測試 API
```bash
curl -X GET http://localhost:3000/
curl -X GET http://localhost:3000/api/download-zip \
  -o generated_files.zip
```

---

## 📈 下一步建議

1. **短期** → 完成端到端測試
2. **中期** → 添加單元測試
3. **長期** → Docker 容器化和微服務架構

詳見: [PROJECT_COMPLETION_REPORT.md#下一步改進](PROJECT_COMPLETION_REPORT.md)

---

**祝您使用愉快！** 🎉

*如有問題，請查閱相應的文檔或檢查日誌。*
