# 🎯 AutoCreateForm - CSV整合測試指南

## 現在狀態
✅ **Word測試表單已建立**: `public/TestLaptopForm.docx`
✅ **CSV已修復**: `tools/LaptopInventory.csv` (2台筆記本電腦數據)
✅ **伺服器已啟動**: http://localhost:3000

---

## 📋 完整整合步驟

### 第1步: 定義字段 (Define Fields)

在Web界面中輸入以下字段名稱(必須與CSV標題完全相符):

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

**重要**: 點擊"Add Field"將每個字段添加到列表中,第一個字段必須是"ID"

---

### 第2步: 上傳CSV文件 (Upload Excel File)

**文件位置**: `tools/LaptopInventory.csv`

**預期內容**:
```
ID,SN,Model,Manufacturer,ComputerName,MAC,WiFiAdapter,EthernetAdapter,OSVersion,OSBuild,InstallDate,CPU,RAM,DiskSize,DiskFree,BatteryStatus,BatteryHealth,CurrentUser,Domain
L20251208164520,3196308701449,20235,LENOVO,NAME-PC,20-89-84-XX-XX-XX,...
L20251208165132,3196308701449,20235,LENOVO,NAME-PC,20-89-84-XX-XX-XX,...
```

**預覽**: 應該顯示2筆記錄,19個字段

---

### 第3步: 上傳Word模板 (Upload Word Template)

**文件位置**: `public/TestLaptopForm.docx`

**模板內容**:
- 設備信息部分 (15個計算機字段):
  - {ID}, {SN}, {Model}, {Manufacturer}, {ComputerName}
  - {MAC}, {WiFiAdapter}, {EthernetAdapter}
  - {OSVersion}, {OSBuild}, {InstallDate}
  - {CPU}, {RAM}, {DiskSize}, {DiskFree}, {BatteryStatus}
  - {CurrentUser}
  
- 借用人信息部分 (手動填寫欄位):
  - 借用人名字/Name
  - 部門/Department
  - 借用日期/Borrowing Date
  - 預期歸還日期/Return Date
  - 備註/Notes

---

### 第4步: 生成表單 (Generate Forms)

**選項**:
- ☑️ 生成Word文檔 (Generate Word Documents) - 預設選中
- ☑️ 生成PDF文件 (Generate PDF) - 需要LibreOffice(可選)

**預期結果**:
- 2個生成的表單 (每筆CSV記錄一個)
- 文件名格式: `Generated_YYYYMMDD_HHMMSS.docx` / `.pdf`
- 所有{FieldName}占位符已替換為CSV中的數據
- 文件會自動打包成ZIP下載

---

## 🔍 故障排除

### 問題1: "上傳失敗 - 沒有檢測到行"
**原因**: CSV編碼或格式問題
**解決方案**:
1. 確保CSV使用UTF-8編碼
2. 使用逗號(,)分隔符
3. 運行修復工具: `node fixCSV.js`

### 問題2: "字段未更新 - 占位符仍然可見"
**原因**: 字段名稱不匹配(大小寫敏感)
**解決方案**:
1. 確保定義的字段名稱與模板中的占位符完全相符
2. 檢查CSV標題是否與定義的字段匹配
3. Word模板中的占位符必須使用: `{FieldName}` (不是 {{FieldName}})

### 問題3: "PDF生成失敗"
**原因**: 未安裝LibreOffice
**解決方案**:
1. 在PDF選項前取消勾選
2. 或安裝LibreOffice: https://www.libreoffice.org/download/
3. 設置環境變數指向LibreOffice可執行文件

### 問題4: "CSV數據未正確顯示"
**原因**: 長字段值導致分隔符混亂
**解決方案**:
1. 已修復,使用提供的`LaptopInventory.csv`
2. 確保所有逗號包含在引號中: `"value, with comma"`

---

## 📊 CSV數據結構

| 字段 | 描述 | 示例 |
|------|------|------|
| ID | 設備唯一識別碼 | L20251208164520 |
| SN | 序列號 | 3196308701449 |
| Model | 型號 | 20235 |
| Manufacturer | 製造商 | LENOVO |
| ComputerName | 電腦名稱 | NAME-PC |
| MAC | MAC地址 | 20-89-84-XX-XX-XX |
| WiFiAdapter | WiFi適配器 | Broadcom 802.11n |
| EthernetAdapter | 以太網適配器 | Qualcomm Atheros... |
| OSVersion | 操作系統版本 | Microsoft Windows 10 Pro |
| OSBuild | 系統編譯號 | 22H2 (19045) |
| InstallDate | 安裝日期 | 01-08-20 |
| CPU | 處理器 | Intel(R) Core(TM) i3-3110M |
| RAM | 內存 | 8 GB |
| DiskSize | 磁盤容量 | 223 GB |
| DiskFree | 可用空間 | 30 GB |
| BatteryStatus | 電池狀態 | No Battery |
| BatteryHealth | 電池健康度 | N/A |
| CurrentUser | 當前用戶 | fung |
| Domain | 域 | fung-PC |

---

## ✅ 測試檢查清單

- [ ] 伺服器運行在 http://localhost:3000
- [ ] Word模板文件存在: `public/TestLaptopForm.docx`
- [ ] CSV文件存在: `tools/LaptopInventory.csv`
- [ ] 定義了19個字段
- [ ] CSV預覽顯示2筆記錄
- [ ] Word模板上傳成功
- [ ] 點擊生成後 ZIP 文件下載
- [ ] 解壓ZIP查看生成的表單
- [ ] 所有占位符都被替換為實際數據
- [ ] (可選) PDF文件可以正常打開

---

## 🚀 批量處理工作流

一旦測試成功,可以進行以下步驟:

1. **收集更多數據**:
   ```powershell
   .\tools\CollectLaptopInfo.bat
   ```
   在30+台電腦上運行此命令

2. **合并所有數據**:
   ```powershell
   .\tools\MergeToExcel.ps1
   ```
   生成包含所有記錄的 `LaptopInventory.csv`

3. **批量生成表單**:
   - 上傳新的 `LaptopInventory.csv` (含50+記錄)
   - 使用相同的 `TestLaptopForm.docx` 模板
   - 生成50+份借用表單

---

## 📞 支持

如果仍然遇到問題:
1. 檢查伺服器控制台是否有錯誤消息
2. 查看瀏覽器開發者工具 (F12) 的網絡請求
3. 確保所有字段名稱區分大小寫
4. 驗證CSV編碼為UTF-8

---

**製作**: 100% Claude
**日期**: 2025-12-21
