# 🎯 CSV 整合 - 測試記錄

**日期**: 2025-12-21
**目標**: 驗證 AutoCreateForm 與 CSV 數據的完整整合

---

## ✅ 完成的準備工作

### 1. Word 測試表單
- **文件**: `public/TestLaptopForm.docx`
- **大小**: 14.05 KB
- **占位符數**: 15 個
  - 設備信息: ID, SN, Model, Manufacturer, ComputerName, MAC, WiFiAdapter, EthernetAdapter, OSVersion, CPU, RAM, DiskSize, DiskFree, BatteryStatus, CurrentUser
  - 借用信息: Name, Department, BorrowingDate, ReturnDate, Notes (手動填寫)
- **語言**: 雙語 (English / 繁體中文)

### 2. CSV 數據文件
- **原始文件**: `tools/LaptopInventory.csv`
- **修復工具**: `fixCSV.js`
- **修復內容**:
  - ✅ 修復了 OSVersion 編碼亂碼
  - ✅ 修復了 SN 科學記數法
  - ✅ 確保 UTF-8 編碼
  - ✅ 標準化 CSV 格式
- **記錄數**: 2 (測試用)
- **字段數**: 19

### 3. 整合驗證腳本
- **文件**: `validateIntegration.js`
- **驗證項**:
  ✅ CSV 文件有效性
  ✅ Word 模板 DOCX 結構
  ✅ 占位符檢測
  ✅ 字段映射驗證
  ✅ 伺服器連接性
- **驗證結果**: 
  - CSV: ✅ 有效 (19 字段, 2 記錄)
  - Word: ✅ 有效 (15 占位符)
  - 字段映射: ✅ 匹配 (4 個字段未在模板中使用,但無妨)
  - 伺服器: ⏳ 運行中

### 4. 快速指南
- **文件**: `QUICK_START_CSV.md`
- **內容**: 4 步驟操作指南
- **目標受眾**: 最終用戶

### 5. 詳細指南
- **文件**: `CSV_INTEGRATION_GUIDE.md`
- **內容**: 詳細技術文檔,包含故障排除

---

## 📊 CSV 數據結構驗證

| 字段 | 示例值 | 類型 | 備註 |
|------|--------|------|------|
| ID | L20251208164520 | String | ✅ 自動生成,時間戳格式 |
| SN | 3196308701449 | String | ✅ 序列號 |
| Model | 20235 | String | ✅ 設備型號 |
| Manufacturer | LENOVO | String | ✅ 廠商 |
| ComputerName | NAME-PC | String | ✅ 電腦名稱 |
| MAC | 20-89-84-XX-XX-XX | String | ✅ MAC 地址 (已掩碼) |
| WiFiAdapter | Broadcom 802.11n Network Adapter | String | ✅ WiFi 卡型號 |
| EthernetAdapter | Qualcomm Atheros AR8172... | String | ✅ 以太網卡 |
| OSVersion | Microsoft Windows 10 Pro | String | ✅ 作業系統版本 |
| OSBuild | 22H2 (19045) | String | ✅ 作業系統編譯號 |
| InstallDate | 43838 (Excel 日期序列) | Number | ⚠️ 需要格式化顯示 |
| CPU | Intel(R) Core(TM) i3-3110M CPU @ 2.40GHz | String | ✅ 處理器型號 |
| RAM | 8 GB | String | ✅ 內存容量 |
| DiskSize | 223 GB | String | ✅ 磁盤容量 |
| DiskFree | 30 GB | String | ✅ 可用空間 |
| BatteryStatus | No Battery | String | ✅ 電池狀態 |
| BatteryHealth | N/A | String | ✅ 電池健康度 |
| CurrentUser | fung | String | ✅ 當前用戶 |
| Domain | fung-PC | String | ✅ 域 |

---

## 🚀 測試步驟 (待執行)

### 第 1 階段: 基本功能測試

- [ ] 啟動服務器: `npm start`
- [ ] 打開瀏覽器: http://localhost:3000
- [ ] 在 Step 1 定義所有 19 個字段
- [ ] 在 Step 2 上傳 `tools/LaptopInventory.csv`
- [ ] 驗證數據預覽顯示 2 筆記錄
- [ ] 在 Step 3 上傳 `public/TestLaptopForm.docx`
- [ ] 在 Step 4 勾選"Generate Word Documents"
- [ ] 點擊"Generate Files"
- [ ] 下載生成的 ZIP 文件
- [ ] 解壓並檢查生成的 DOCX 文件

### 第 2 階段: 內容驗證

- [ ] 打開生成的 DOCX 文件
- [ ] 驗證設備信息都被正確替換:
  - [ ] ID 顯示為 L20251208164520 (第一份)
  - [ ] SN 顯示為 3196308701449
  - [ ] Model 顯示為 20235
  - [ ] Manufacturer 顯示為 LENOVO
  - [ ] MAC 顯示為實際地址
  - [ ] CPU 顯示為 Intel i3-3110M
  - [ ] RAM 顯示為 8 GB
  - [ ] 其他字段同樣正確
- [ ] 驗證借用信息欄位為空白(待手動填寫)
- [ ] 檢查格式和排版是否完整

### 第 3 階段: 批量生成測試 (可選)

- [ ] 增加 CSV 中的測試記錄到 5-10 筆
- [ ] 重複生成過程
- [ ] 驗證生成 5-10 份表單
- [ ] 確認每份表單的數據都準確無誤

### 第 4 階段: 錯誤處理測試 (可選)

- [ ] 刪除某個字段定義,嘗試生成(應報錯)
- [ ] 上傳沒有占位符的 Word 模板(應生成但不替換)
- [ ] 上傳格式不正確的 CSV(應報錯)
- [ ] 測試 PDF 生成(如果安裝了 LibreOffice)

---

## 🔧 故障排除指南

### 問題 1: 占位符未被替換
```
症狀: 生成的 DOCX 中仍然顯示 {ID}, {MAC} 等
原因: 字段名稱不匹配或 Word 模板中的占位符格式錯誤
解決:
1. 確保 Word 模板中使用的是 {FieldName} (單花括號)
2. 檢查 CSV 標題與定義的字段名稱完全相同
3. 運行 validateIntegration.js 檢查字段映射
```

### 問題 2: CSV 數據顯示亂碼
```
症狀: 某些字段顯示為亂碼或特殊符號
原因: CSV 編碼問題
解決:
1. 運行 node fixCSV.js
2. 重新上傳修復後的 CSV
3. 重新生成表單
```

### 問題 3: 伺服器連接失敗
```
症狀: 打開 http://localhost:3000 無反應
原因: 伺服器未啟動
解決:
1. 運行 npm start
2. 等待看到 "✓ 伺服器運行在 http://localhost:3000"
3. 然後打開瀏覽器
```

### 問題 4: PDF 生成失敗
```
症狀: 勾選 PDF 選項後報錯
原因: 未安裝 LibreOffice 或路徑配置不正確
解決:
1. 取消勾選 PDF 選項,只生成 DOCX
2. 或安裝 LibreOffice: https://www.libreoffice.org
3. 配置環境變數指向 LibreOffice
```

---

## 📈 下一步計畫

### 短期 (本周)
1. ✅ 建立 Word 測試模板
2. ✅ 準備和修復 CSV 數據
3. ✅ 建立驗證和指南文檔
4. ⏳ **執行本測試計畫** (本步驟)
5. ⏳ 確認整合成功
6. ⏳ 提交 GitHub

### 中期 (下周)
1. 在 30+ 台電腦上執行 `CollectLaptopInfo.bat`
2. 合併所有數據: `MergeToExcel.ps1`
3. 上傳大規模 CSV (100+ 記錄)
4. 批量生成 100+ 份借用表單

### 長期
1. 優化表單模板設計
2. 添加更多自定義字段
3. 集成數據庫管理
4. 建立表單分發和跟蹤系統

---

## 📝 技術備註

### CSV 編碼處理
- 原始文件: 混合編碼,含有亂碼
- 修復工具: `fixCSV.js` (使用 XLSX 庫確保一致性)
- 最終格式: UTF-8 CSV, 標準逗號分隔

### Word 模板生成
- 工具: `createTestWordTemplate.js`
- 方式: 使用 Node.js JSZip 庫直接構建 DOCX XML
- 優勢: 不需要 Office 應用程序,完全自動化

### 占位符替換算法
- 位置: `server/app.js` 中的 `createWordDocument()` 函數
- 方法: 靈活的正則表達式,處理 Word 的 XML 標籤分割問題
- 範圍: 支持任意長度的字段名 (包括 2 字符短名如 MAC, ID)

---

## ✅ 檢查清單 (測試前)

- [x] Word 模板已生成
- [x] CSV 已修復
- [x] 伺服器可啟動
- [x] 驗證腳本通過
- [ ] 手動測試執行中...
- [ ] 測試通過
- [ ] GitHub 提交

---

**記錄者**: GitHub Copilot
**日期**: 2025-12-21
**狀態**: 準備就緒,等待手動測試確認
