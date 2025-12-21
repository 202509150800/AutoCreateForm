# 🚀 快速開始 - CSV整合表單生成

## 🎯 你現在擁有什麼

✅ **CSV文件**: `tools/LaptopInventory.csv` 
   - 2台筆記本電腦的完整硬體信息
   - 19個字段 (ID, SN, Model, MAC, CPU, RAM等)

✅ **Word模板**: `public/TestLaptopForm.docx`
   - 包含15個自動替換的硬體字段占位符
   - 包含5個手動填寫的借用信息欄位
   - 雙語設計 (英文/繁體中文)

✅ **Web界面**: http://localhost:3000
   - 4步驟表單生成系統
   - 支持批量生成 (可生成50+份表單)

---

## 📝 整合步驟 (4步)

### 第1步: 定義字段 

在Web界面的「Define Fields」部分,輸入以下19個字段名稱:

```
ID
SN
Model
Manufacturer
ComputerName
MAC
WiFiAdapter
EthernetAdapter
OSVersion
OSBuild
InstallDate
CPU
RAM
DiskSize
DiskFree
BatteryStatus
BatteryHealth
CurrentUser
Domain
```

**💡 提示**: 
- 字段名稱必須與CSV的標題完全相同 (區分大小寫)
- 第一個字段必須是 ID
- 點擊"Add Field"添加每個字段

---

### 第2步: 上傳資料檔案

支持兩種格式:

**🔸 CSV 檔案** (.csv) ⭐ **推薦使用**
```
1. 點擊「上傳 資料檔案」
2. 選擇: tools/LaptopInventory.csv
3. 系統會顯示數據預覽 (應該看到2筆記錄)
```

**🔸 Excel 檔案** (.xlsx / .xls)
```
1. 點擊「上傳 資料檔案」
2. 選擇: 你的 Excel 檔案
3. 系統會顯示數據預覽
```

系統會自動偵測文件格式並正確解析。

---

### 第3步: 上傳Word模板

1. 點擊「上傳 Word 範本」
2. 選擇: `public/TestLaptopForm.docx`
3. 確認上傳成功

**占位符格式**: 必須使用單花括號
```
正確:   {ID}, {MAC}, {CPU}
錯誤:   {{ID}}, [[MAC]], [CPU]
```

---

### 第4步: 生成表單

1. 勾選生成選項:
   - ☑️ Generate Word Documents (生成DOCX)
   - ☑️ Generate PDF (生成PDF) - 可選

2. 點擊「Generate Files」

3. 下載並解壓ZIP文件:
   ```
   Generated_YYYYMMDD_HHMMSS/
   ├── Generated_Record_1.docx
   ├── Generated_Record_2.docx
   └── ...
   ```

---

## 📋 預期結果

✅ **成功指標**:
- 生成2份Word文檔
- 所有計算機信息自動填入 (不再是{ID}之類的占位符)
- 數據準確無誤
- 借用信息欄位為空白(待手動填寫)

❌ **如果失敗**:
- 檢查是否所有字段都定義了
- 確認CSV文件已正確上傳
- 查看瀏覽器控制台(F12)的錯誤信息
- 運行驗證工具: `node validateIntegration.js`

---

## 🔧 修復工具

如果CSV有編碼問題:
```bash
node fixCSV.js
```

重新驗證整個系統:
```bash
node validateIntegration.js
```

---

## 🎓 下一步 (批量處理)

一旦測試成功,可以:

1. **收集所有筆記本電腦數據** (30+台):
   ```bash
   # 在每台電腦上執行
   .\tools\CollectLaptopInfo.bat
   ```

2. **合並所有收集的數據**:
   ```bash
   .\tools\MergeToExcel.ps1
   ```
   產生: `tools/LaptopInventory.csv` (50+記錄)

3. **批量生成借用表單**:
   - 上傳包含50+記錄的CSV
   - 使用相同的Word模板
   - 一次生成50+份表單!

---

## ❓ 常見問題

**Q: 為什麼占位符沒有被替換?**
A: 檢查字段名稱是否完全匹配 CSV 標題,區分大小寫

**Q: CSV 數據顯示有亂碼?**
A: 運行 `node fixCSV.js` 修復編碼

**Q: 可以使用我自己的 Word 模板嗎?**
A: 可以,但必須使用 `{FieldName}` 格式的占位符

**Q: 生成 PDF 失敗?**
A: 取消勾選 PDF 選項,或安裝 LibreOffice

**Q: 可以同時生成 100+ 份表單嗎?**
A: 可以,但建議分批進行(每次 50 份左右)

---

## 📞 技術支持

如需幫助:
1. 檢查 `CSV_INTEGRATION_GUIDE.md` 詳細指南
2. 運行 `node validateIntegration.js` 診斷問題
3. 查看瀏覽器開發者工具的網絡和控制台選項卡

---

**開發者**: 100% Claude
**最後更新**: 2025-12-21
