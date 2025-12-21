# CSV 整合 - 修复报告

## 问题诊断

### 原始问题
- 用户无法生成 Word 表单，后端返回 400 Bad Request 错误
- 服务器日志显示 CSV 标题解析错误：`'"ID"'` 而不是 `ID`

### 根本原因
1. **CSV 文件编码问题**
   - CSV 文件第一列头带有引号：`"ID",SN,Model,...`
   - 简单的 `.split(',')` 方法不能正确处理引号字符

2. **后端 CSV 解析逻辑不足**
   - 没有处理 CSV 标准的引号规则
   - 没有移除 BOM（Byte Order Mark）标记
   - 不能正确清理引号包含的字段名

3. **字段匹配失败**
   - 用户定义字段：`ID`
   - 服务器读取为：`'"ID"'`（带引号）
   - 导致字段验证失败

## 实施的修复

### 1. 添加 CSV 行解析函数 (server/app.js)
```javascript
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            // 处理转义引号
            if (insideQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}
```

**功能**：
- ✓ 正确处理 CSV 中的引号
- ✓ 支持转义引号（双引号）
- ✓ 保持引号内的逗号完整

### 2. 移除 BOM 标记
```javascript
let csvContent = fs.readFileSync(excelPath, 'utf-8');
csvContent = csvContent.replace(/^\uFEFF/, '');
```

### 3. 清理字段名称
```javascript
const headers = parseCSVLine(headerLine).map(h => {
    return h.trim().replace(/^"|"$/g, '');
});
```

**效果**：
- `"ID"` → `ID`
- `"SN"` → `SN`
- `"Model"` → `Model`

### 4. 清理数据值
```javascript
const value = (values[index] || '').trim().replace(/^"|"$/g, '');
```

## 验证结果

测试脚本 `testCSVParsing.js` 证实：

### LaptopInventory_Fixed.csv（带引号）
```
原始标题行：  "ID",SN,Model,Manufacturer,...
解析后：     ID, SN, Model, Manufacturer,...
ID 值：      L20251208164520 ✓
```

### LaptopInventory_Clean.csv（不带引号）
```
原始标题行：  ID,SN,Model,Manufacturer,...
解析后：     ID, SN, Model, Manufacturer,...
ID 值：      L20251208164520 ✓
```

**所有 19 个字段都能正确解析：**
✓ ID, SN, Model, Manufacturer, ComputerName
✓ MAC, WiFiAdapter, EthernetAdapter, OSVersion, OSBuild
✓ InstallDate, CPU, RAM, DiskSize, DiskFree
✓ BatteryStatus, BatteryHealth, CurrentUser, Domain

## 后续使用

### 更新的 CSV 文件位置
- 原始（带引号）：`tools/LaptopInventory_Fixed.csv`
- 清理版本：`tools/LaptopInventory_Clean.csv`

### 推荐做法
1. **使用清理版本** - `LaptopInventory_Clean.csv`
   - 更干净，更容易处理
   - 避免 CSV 编码问题

2. **系统支持两种格式**
   - 后端现在可以处理带引号的 CSV 文件
   - 也可以处理不带引号的 CSV 文件
   - 引号会自动被移除

## 成功指标

修复完成后，用户应该能够：
- ✓ 批量定义 19 个字段
- ✓ 上传 CSV 文件（带或不带引号）
- ✓ 上传 Word 模板
- ✓ 生成 Word 文档（每行 CSV 一个）
- ✓ 下载 ZIP 文件包

## 文件变更

修改文件：
- `server/app.js` - 添加 `parseCSVLine()` 函数和改进的 CSV 处理
- `tools/LaptopInventory_Clean.csv` - 新建清理版本

创建文件：
- `testCSVParsing.js` - 验证脚本

## 下一步

1. 测试完整的工作流程
2. 验证生成的 Word 文档
3. 确认 PDF 转换（如果需要）
4. 上传修复到 GitHub
