/**
 * CSV 解析工具
 * 處理 CSV 文件的讀取和解析
 */

/**
 * 解析 CSV 單行數據
 * 正確處理引號和逗號
 * 
 * @param {string} line - CSV 行文本
 * @returns {string[]} 解析後的字段數組
 * 
 * @example
 * parseCSVLine('"Name","Age","City"')
 * // Returns: ['Name', 'Age', 'City']
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            // 處理轉義引號
            if (insideQuotes && nextChar === '"') {
                current += '"';
                i++; // 跳過下一個引號
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

/**
 * 解析整個 CSV 文件
 * 
 * @param {string} csvContent - CSV 文件內容
 * @returns {Object[]} 解析後的數據對象數組
 * 
 * @throws {Error} 如果 CSV 格式不正確
 */
function parseCSVContent(csvContent) {
    // 移除 BOM 標記
    csvContent = csvContent.replace(/^\uFEFF/, '');
    
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
        throw new Error('CSV 檔案無資料');
    }
    
    // 解析標題行
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => {
        return h.trim().replace(/^"|"$/g, '');
    });
    
    // 解析數據行
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
            const value = (values[index] || '').trim().replace(/^"|"$/g, '');
            row[header] = value;
        });
        // 跳過空行
        if (Object.values(row).some(v => v)) {
            data.push(row);
        }
    }
    
    return data;
}

module.exports = {
    parseCSVLine,
    parseCSVContent
};
