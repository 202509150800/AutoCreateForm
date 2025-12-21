# AutoCreateForm API 文檔

## 概述

AutoCreateForm 提供了完整的 RESTful API，用於批量生成 Word 和 PDF 文檔。

**基礎 URL**: `http://localhost:3000`

---

## API 端點

### 1. GET / - 主頁面

返回應用的主頁面 HTML。

#### 請求

```bash
GET / HTTP/1.1
Host: localhost:3000
```

#### 響應

```
Status: 200 OK
Content-Type: text/html

<!DOCTYPE html>
...
```

---

### 2. POST /api/generate - 生成文檔

核心 API，根據提供的數據和模板生成 Word 和/或 PDF 文檔。

#### 請求

```bash
POST /api/generate HTTP/1.1
Host: localhost:3000
Content-Type: multipart/form-data

[multipart form data]
```

#### 請求參數（FormData）

| 參數 | 類型 | 必須 | 說明 |
|------|------|------|------|
| `excelFile` | File | 是 | Excel (.xlsx/.xls) 或 CSV 文件，包含要替換的數據 |
| `wordFile` | File | 是 | Word 模板文件 (.docx) |
| `columns` | JSON | 否 | 要替換的字段列表，JSON 字符串，默認 `["ID"]` |
| `generatePDF` | boolean | 否 | 是否生成 PDF 文件，默認 `false` |
| `generateWord` | boolean | 否 | 是否生成 Word 文件，默認 `true` |

#### 請求示例

```javascript
const formData = new FormData();
formData.append('excelFile', excelFile);           // File 對象
formData.append('wordFile', wordFile);             // File 對象
formData.append('columns', JSON.stringify([
    'ID',
    'Name',
    'Email',
    'Phone'
]));
formData.append('generatePDF', 'true');
formData.append('generateWord', 'true');

fetch('/api/generate', {
    method: 'POST',
    body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

#### 成功響應

```json
{
  "success": true,
  "totalFiles": 10,
  "wordCount": 10,
  "pdfCount": 10,
  "totalRecords": 5,
  "errors": null
}
```

**響應欄位說明**:

| 欄位 | 類型 | 說明 |
|------|------|------|
| `success` | boolean | 操作是否成功 |
| `totalFiles` | number | 生成的文件總數 |
| `wordCount` | number | 生成的 Word 文件數 |
| `pdfCount` | number | 生成的 PDF 文件數 |
| `totalRecords` | number | 處理的數據記錄數 |
| `errors` | array | 錯誤消息列表（如果有） |

#### 錯誤響應

##### 缺少文件

```json
{
  "message": "❌ 缺少必要的檔案:\n- 請上傳 Excel 或 CSV 資料檔案\n- 請上傳 Word 範本檔案 (.docx)"
}
```

##### 無效的 CSV 格式

```json
{
  "message": "檔案讀取失敗: CSV 檔案無資料"
}
```

##### Excel 缺少 ID 列

```json
{
  "message": "Excel 必須包含 ID 欄位"
}
```

##### 服務器錯誤

```json
{
  "message": "伺服器錯誤: Internal error message"
}
```

#### HTTP 狀態碼

| 狀態碼 | 說明 |
|--------|------|
| 200 | 成功 |
| 400 | 請求錯誤（缺少文件、無效格式等） |
| 500 | 服務器內部錯誤 |

---

### 3. GET /api/download-zip - 下載生成的文件

下載所有已生成的文檔作為 ZIP 壓縮包。

#### 請求

```bash
GET /api/download-zip HTTP/1.1
Host: localhost:3000
```

#### 響應

```
Status: 200 OK
Content-Type: application/zip
Content-Disposition: attachment; filename="generated_files.zip"

[binary zip file content]
```

#### 示例

```javascript
// 前端實現
async function downloadAll() {
    const response = await fetch('/api/download-zip');
    const blob = await response.blob();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated_files.zip';
    link.click();
    URL.revokeObjectURL(url);
}
```

#### 錯誤響應

```json
{
  "message": "沒有生成任何檔案"
}
```

---

## 數據格式

### Excel 格式

```
[ID]        [Name]     [Email]              [Phone]
L001        張三       zs@example.com      13800138000
L002        李四       ls@example.com      13900139000
L003        王五       ww@example.com      14000140000
```

**要求**:
- 第一行為標題（列名）
- 必須包含 `ID` 列
- 區分大小寫

### CSV 格式

```csv
"ID","Name","Email","Phone"
"L001","張三","zs@example.com","13800138000"
"L002","李四","ls@example.com","13900139000"
"L003","王五","ww@example.com","14000140000"
```

**要求**:
- UTF-8 編碼
- 使用雙引號圍繞字段
- 逗號分隔符
- 第一行為標題

### Word 模板格式

模板中使用 `{{FieldName}}` 作為占位符：

```
設備信息表

設備 ID: {{ID}}
所有者: {{Name}}
郵箱: {{Email}}
電話: {{Phone}}

日期: ____________
簽名: ____________
```

**要求**:
- 占位符格式: `{{FieldName}}`
- 占位符名稱必須與數據列名完全相同（區分大小寫）
- 占位符必須是純文本（不帶格式化）
- 保存為 .docx 格式

---

## 常見使用場景

### 場景 1: 簡單的批量生成

```javascript
// 生成 10 個帶有員工信息的 Word 文檔

const formData = new FormData();
formData.append('excelFile', employeeExcel);
formData.append('wordFile', contractTemplate);
formData.append('columns', JSON.stringify(['ID', 'Name', 'Position', 'Department']));
formData.append('generateWord', 'true');
formData.append('generatePDF', 'false');

const response = await fetch('/api/generate', {
    method: 'POST',
    body: formData
});

const result = await response.json();
console.log(`成功生成 ${result.wordCount} 個 Word 文檔`);
```

### 場景 2: 生成 Word 和 PDF

```javascript
// 同時生成 Word 和 PDF

formData.append('generateWord', 'true');
formData.append('generatePDF', 'true');

// API 將生成:
// - output/ID1.docx, output/ID1.pdf
// - output/ID2.docx, output/ID2.pdf
// - ...
```

### 場景 3: 使用 CSV 數據

```javascript
// 使用 CSV 文件而不是 Excel

const csvFile = new File(
    [csvContent],
    'data.csv',
    { type: 'text/csv' }
);

formData.append('excelFile', csvFile);
formData.append('wordFile', wordTemplate);
```

---

## 錯誤處理

### 標準錯誤響應結構

```json
{
  "message": "錯誤描述信息"
}
```

### 常見錯誤及解決方案

| 錯誤消息 | 原因 | 解決方案 |
|---------|------|---------|
| "缺少必要的檔案" | 沒有上傳 Excel 或 Word 文件 | 確保兩個文件都已上傳 |
| "CSV 檔案無資料" | CSV 文件為空或格式不正確 | 檢查 CSV 格式是否正確 |
| "Excel 必須包含 ID 欄位" | 數據中缺少 ID 列 | 添加 ID 列並重新上傳 |
| "檔案讀取失敗" | 文件損壞或格式不支持 | 驗證文件並重新上傳 |

---

## 返回值詳解

### 成功情況下的響應

```javascript
{
  "success": true,              // 操作成功標誌
  "totalFiles": 5,              // 生成的文件總數 (Word + PDF)
  "wordCount": 5,               // 生成的 Word 文件數
  "pdfCount": 5,                // 生成的 PDF 文件數
  "totalRecords": 5,            // 輸入數據的總記錄數
  "errors": null                // 如果沒有錯誤，為 null
}
```

### 部分失敗的情況

```javascript
{
  "success": true,
  "totalFiles": 4,              // 只生成了 4 個
  "wordCount": 4,
  "pdfCount": 4,
  "totalRecords": 5,            // 但有 5 條記錄
  "errors": [
    "行 3 (ID: L003): Word 文件不存在",
    "行 5 (ID: L005): PDF 轉換失敗"
  ]                             // 錯誤詳情
}
```

---

## 性能指標

### 典型性能

| 操作 | 時間 | 說明 |
|------|------|------|
| 解析 CSV（1000 行） | < 1 秒 | 取決於行數和字段數 |
| 生成 Word（單個） | < 2 秒 | 模板大小會影響 |
| Word 轉 PDF（單個） | 2-5 秒 | 取決於系統性能 |
| 批量生成（100 個） | 3-10 分鐘 | 包括 PDF 轉換 |

### 限制

| 限制 | 值 | 說明 |
|------|-----|------|
| 最大文件大小 | 50 MB | 上傳的單個文件 |
| 最大記錄數 | 1000 | 建議值，超過時性能下降 |
| 最大字段數 | 50 | 每條記錄的字段數 |

---

## SDK 和工具

### JavaScript 客戶端示例

```javascript
class AutoCreateFormClient {
    constructor(baseURL = 'http://localhost:3000') {
        this.baseURL = baseURL;
    }

    async generate(excelFile, wordFile, columns, options = {}) {
        const formData = new FormData();
        formData.append('excelFile', excelFile);
        formData.append('wordFile', wordFile);
        formData.append('columns', JSON.stringify(columns));
        formData.append('generatePDF', options.generatePDF !== false);
        formData.append('generateWord', options.generateWord !== false);

        const response = await fetch(`${this.baseURL}/api/generate`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
    }

    async downloadZip() {
        const response = await fetch(`${this.baseURL}/api/download-zip`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'generated_files.zip';
        link.click();
        URL.revokeObjectURL(url);
    }
}

// 使用
const client = new AutoCreateFormClient();
const result = await client.generate(
    excelFile,
    wordFile,
    ['ID', 'Name', 'Email']
);
console.log(result);
```

---

## 版本控制

### API 版本歷史

| 版本 | 日期 | 變化 |
|------|------|------|
| 2.1.0 | 2025-12-21 | 支持 {{KEY}} 格式佔位符，改進 XML 處理 |
| 2.0.0 | 2025-11-30 | 移除下載模板功能，改為在界面中定義字段 |
| 1.0.0 | 2025-10-01 | 初始版本 |

---

## 支援

- **文檔**: [BEST_PRACTICES.md](BEST_PRACTICES.md)
- **README**: [README.md](README.md)
- **常見問題**: [FAQ.md](FAQ.md)

