/**
 * PDF 轉換工具
 * 使用 LibreOffice 將 Word 文檔轉換為 PDF
 */

const { execSync } = require('child_process');
const path = require('path');

// 配置 LibreOffice 路徑
process.env.PATH = 'C:\\Program Files\\LibreOffice\\program;' + process.env.PATH;

/**
 * 檢查 LibreOffice 是否可用
 * 
 * @returns {boolean} LibreOffice 是否可用
 */
function isLibreOfficeAvailable() {
    try {
        execSync('soffice --version', { stdio: 'pipe' });
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * 將 Word 文檔轉換為 PDF
 * 
 * @param {string} wordPath - Word 文件路徑 (.docx)
 * @param {string} id - 文檔 ID (用於文件命名)
 * @param {string} outputDir - 輸出目錄
 * @returns {Promise<Object>} 轉換結果 {success, message, pdfPath}
 * 
 * @example
 * const result = await convertWordToPDF('./doc.docx', 'ID123', './output');
 * if (result.success) {
 *   console.log(`PDF saved to ${result.pdfPath}`);
 * }
 */
async function convertWordToPDF(wordPath, id, outputDir) {
    return new Promise((resolve) => {
        try {
            // 檢查 LibreOffice 可用性
            if (!isLibreOfficeAvailable()) {
                console.warn('⚠️ LibreOffice 不可用，跳過 PDF 轉換');
                resolve({
                    success: false,
                    message: 'LibreOffice 未安裝',
                    pdfPath: null
                });
                return;
            }
            
            // 執行轉換命令
            const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${wordPath}"`;
            execSync(command, { stdio: 'pipe' });
            
            const pdfPath = path.join(outputDir, `${id}.pdf`);
            resolve({
                success: true,
                message: `PDF 轉換成功: ${id}.pdf`,
                pdfPath
            });
            
        } catch (error) {
            console.warn(`⚠️ PDF 轉換失敗: ${error.message}`);
            resolve({
                success: false,
                message: `PDF 轉換失敗: ${error.message}`,
                pdfPath: null
            });
        }
    });
}

module.exports = {
    isLibreOfficeAvailable,
    convertWordToPDF
};
