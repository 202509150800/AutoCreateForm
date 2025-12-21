/**
 * Word 文檔生成和編輯工具
 * 處理占位符替換和 Word 文檔生成
 */

const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

/**
 * 為字符串創建靈活的正則表達式
 * 允許字符之間有 XML 標籤（處理 Word 的標籤分割問題）
 * 
 * @param {string} str - 要匹配的字符串
 * @returns {string} 正則表達式模式
 * 
 * @example
 * createFlexibleRegex('MAC')
 * // Returns: 'M(?:<[^>]*>)*A(?:<[^>]*>)*C'
 */
function createFlexibleRegex(str) {
    let pattern = '';
    for (let i = 0; i < str.length; i++) {
        // 轉義特殊字符
        pattern += str[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // 允許字符之間有 XML 標籤
        if (i < str.length - 1) {
            pattern += '(?:<[^>]*>)*';
        }
    }
    return pattern;
}

/**
 * 替換 Word 文檔中的占位符
 * 支持 {{KEY}} 和 {KEY} 兩種格式
 * 
 * @param {string} documentXml - Word 文檔 XML 內容
 * @param {Object} data - 替換數據對象
 * @param {string[]} fieldsToReplace - 要替換的字段列表
 * @returns {Object} 替換結果 {xml, stats}
 * 
 * @example
 * const result = replacePlaceholders(xml, {ID: '123', Name: 'John'}, ['ID', 'Name']);
 * console.log(result.stats.replaced); // 2
 */
function replacePlaceholders(documentXml, data, fieldsToReplace) {
    let xml = documentXml;
    const stats = {
        total: 0,
        replaced: 0,
        failed: []
    };
    
    fieldsToReplace.forEach(key => {
        const value = String(data[key] || '');
        const escapedValue = value.replace(/\$/g, '$$$$');
        
        // 構建靈活的鍵模式
        let keyPattern = createFlexibleRegex(key);
        let spacePattern = '(?:<[^>]*>|\\s)*';
        
        // 1. 嘗試匹配 {{KEY}} 格式
        let startPatternDouble = '\\{(?:<[^>]*>)*\\{';
        let endPatternDouble = '\\}(?:<[^>]*>)*\\}';
        let fullPatternDouble = `${startPatternDouble}${spacePattern}${keyPattern}${spacePattern}${endPatternDouble}`;
        let regexDouble = new RegExp(fullPatternDouble, 'g');
        
        let countDouble = (xml.match(regexDouble) || []).length;
        if (countDouble > 0) {
            xml = xml.replace(regexDouble, escapedValue);
            stats.total += countDouble;
            stats.replaced++;
        }
        
        // 2. 嘗試匹配 {KEY} 格式
        let startPatternSingle = '\\{';
        let endPatternSingle = '\\}';
        let fullPatternSingle = `${startPatternSingle}${spacePattern}${keyPattern}${spacePattern}${endPatternSingle}`;
        let regexSingle = new RegExp(fullPatternSingle, 'g');
        
        let countSingle = (xml.match(regexSingle) || []).length;
        if (countSingle > 0) {
            xml = xml.replace(regexSingle, escapedValue);
            stats.total += countSingle;
            stats.replaced++;
        }
        
        if (countDouble === 0 && countSingle === 0) {
            stats.failed.push(key);
        }
    });
    
    return { xml, stats };
}

/**
 * 從 Word 模板創建新文檔
 * 替換所有指定的占位符
 * 
 * @param {string} templatePath - Word 模板文件路徑
 * @param {Object} data - 替換數據
 * @param {string} id - 文檔 ID (用於文件命名)
 * @param {string[]} columnsList - 要替換的字段列表
 * @param {string} outputPath - 輸出文件路徑
 * @returns {Promise<Object>} 生成結果 {success, replacedCount, failedFields}
 * 
 * @throws {Error} 如果文件操作失敗
 */
async function generateWordDocument(templatePath, data, id, columnsList, outputPath) {
    return new Promise(async (resolve, reject) => {
        try {
            // 讀取模板
            const templateBuffer = fs.readFileSync(templatePath);
            const zip = new JSZip();
            const templateZip = await zip.loadAsync(templateBuffer);
            
            // 獲取 document.xml
            let documentXml = await templateZip.file('word/document.xml').async('string');
            
            // 確定要替換的字段
            const fieldsToReplace = columnsList && columnsList.length > 0 
                ? columnsList 
                : Object.keys(data);
            
            // 替換占位符
            const { xml: newXml, stats } = replacePlaceholders(
                documentXml,
                data,
                fieldsToReplace
            );
            
            // 更新文檔
            templateZip.file('word/document.xml', newXml);
            
            // 生成輸出文件
            const outputBuffer = await templateZip.generateAsync({ type: 'nodebuffer' });
            fs.writeFileSync(outputPath, outputBuffer);
            
            resolve({
                success: true,
                replacedCount: stats.replaced,
                totalReplacements: stats.total,
                failedFields: stats.failed
            });
            
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    createFlexibleRegex,
    replacePlaceholders,
    generateWordDocument
};
