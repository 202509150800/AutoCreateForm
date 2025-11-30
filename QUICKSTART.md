# 快速開始指南

## 步驟 1：安裝依賴

```bash
npm install
```

## 步驟 2：啟動應用

```bash
npm start
```

應用將在 **http://localhost:3000** 啟動

## 步驟 3：準備 Excel 資料

1. 點擊「下載 Excel 範本」
2. 在 Excel 中填寫您的資料
3. **必須包含 ID 欄位**（每筆記錄有唯一識別碼）

## 步驟 4：準備 Word 範本

1. 開啟 Microsoft Word
2. 設計您的表格/文件
3. **在要填寫的位置插入佔位符** - 使用格式 `{{欄位名稱}}`

### Word 範本範例：

```
=== 個人資訊表 ===

姓名：{{姓名}}
電話：{{電話}}
地址：{{地址}}

備註：{{備註}}

表單完成日期：__________
```

## 步驟 5：上傳並生成

1. 上傳 Excel 檔案
2. 上傳 Word 範本
3. 選擇生成選項（Word/PDF）
4. 點擊「開始生成」

## 故障排除

### PDF 轉換不工作？

需要安裝 LibreOffice：

**Windows (使用 Chocolatey)：**
```powershell
choco install libreoffice
```

**Windows (直接下載)：**
訪問 https://www.libreoffice.org/download/download/

**macOS：**
```bash
brew install libreoffice
```

**Linux (Ubuntu/Debian)：**
```bash
sudo apt-get install libreoffice
```

### 埠號被占用？

編輯 `server/app.js`，修改：
```javascript
const PORT = process.env.PORT || 3000;
```

改為其他埠號，如 8080。

## 技術支持

- 確保 Node.js 版本 ≥ 14.0
- 檢查網絡連線
- 查看瀏覽器控制台是否有錯誤信息

---

祝您使用愉快！
