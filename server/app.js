const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const JSZip = require('jszip');
const archiver = require('archiver');

// 導入工具模塊
const { parseCSVContent } = require('./utils/csvParser');
const { generateWordDocument } = require('./utils/wordGenerator');
const { convertWordToPDF, isLibreOfficeAvailable } = require('./utils/pdfConverter');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== 目錄配置 ====================
const uploadDir = path.join(__dirname, '../uploads');
const outputDir = path.join(__dirname, '../output');
const tempDir = path.join(__dirname, '../temp');

[uploadDir, outputDir, tempDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ==================== Multer 配置 ====================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `${timestamp}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// ==================== 中間件 ====================
app.use(express.static(path.join(__dirname, '../public')));
// 提供 node_modules 中的 XLSX 庫
app.use('/lib', express.static(path.join(__dirname, '../node_modules/xlsx/dist')));
app.use(express.json());

// ==================== 路由 ====================

/**
 * GET / - 主頁面
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

/**
 * POST /api/generate - 批量生成文檔
 * 
 * 請求體:
 *   - excelFile: Excel/CSV 數據文件
 *   - wordFile: Word 模板文件
 *   - columns: JSON 字符串，字段列表
 *   - generatePDF: 是否生成 PDF ('true'/'false')
 *   - generateWord: 是否生成 Word ('true'/'false')
 * 
 * 響應:
 *   {
 *     success: boolean,
 *     totalFiles: number,
 *     wordCount: number,
 *     pdfCount: number,
 *     totalRecords: number,
 *     errors?: string[]
 *   }
 */
app.post('/api/generate', upload.fields([
    { name: 'excelFile', maxCount: 1 },
    { name: 'wordFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const generatePDF = req.body.generatePDF === 'true';
        const generateWord = req.body.generateWord === 'true';
        let columnsList = [];
        
        try {
            columnsList = JSON.parse(req.body.columns || '["ID"]');
        } catch (e) {
            columnsList = ['ID'];
        }

        // ========== 文件驗證 ==========
        if (!req.files.excelFile || !req.files.wordFile) {
            console.error('❌ 文件驗證失敗:');
            console.error('   Excel/CSV 文件:', req.files.excelFile ? '✓' : '✗ 缺少');
            console.error('   Word 文件:', req.files.wordFile ? '✓' : '✗ 缺少');
            
            let errorMsg = '❌ 缺少必要的檔案:\n';
            if (!req.files.excelFile) {
                errorMsg += '- 請上傳 Excel 或 CSV 資料檔案\n';
            }
            if (!req.files.wordFile) {
                errorMsg += '- 請上傳 Word 範本檔案 (.docx)\n';
            }
            
            return res.status(400).json({ message: errorMsg });
        }

        console.log('✓ 檔案驗證通過:');
        console.log('   Excel/CSV:', req.files.excelFile[0].originalname);
        console.log('   Word:', req.files.wordFile[0].originalname);

        // ========== 讀取文件 ==========
        const excelPath = req.files.excelFile[0].path;
        const wordPath = req.files.wordFile[0].path;
        const fileName = req.files.excelFile[0].originalname.toLowerCase();

        let data = [];
        try {
            if (fileName.endsWith('.csv')) {
                // 解析 CSV
                let csvContent = fs.readFileSync(excelPath, 'utf-8');
                data = parseCSVContent(csvContent);
            } else {
                // 解析 Excel
                const workbook = XLSX.readFile(excelPath);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                data = XLSX.utils.sheet_to_json(sheet);
            }
        } catch (error) {
            return res.status(400).json({ message: '檔案讀取失敗: ' + error.message });
        }

        if (data.length === 0) {
            return res.status(400).json({ message: 'Excel 檔案無資料' });
        }

        // ========== 驗證 ID 字段 ==========
        const actualColumns = Object.keys(data[0]);
        console.log('📊 Excel 欄位名稱:', actualColumns);
        console.log('📊 第一行資料:', data[0]);

        const idField = Object.keys(data[0]).find(key => key.toLowerCase() === 'id');
        if (!idField) {
            return res.status(400).json({ message: 'Excel 必須包含 ID 欄位' });
        }

        // ========== 生成配置日誌 ==========
        let wordCount = 0;
        let pdfCount = 0;
        const errors = [];

        console.log('\n📋 生成檔案配置:');
        console.log('  要替換的欄位列表:', columnsList);
        console.log('  資料中的實際欄位:', Object.keys(data[0]));
        console.log('  生成 Word:', generateWord);
        console.log('  生成 PDF:', generatePDF);
        console.log('  總記錄數:', data.length);

        // ========== 處理每行數據 ==========
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const id = row[idField];

            if (!id) continue;

            try {
                if (generateWord) {
                    await generateWordDocument(wordPath, row, id, columnsList, path.join(outputDir, `${id}.docx`));
                    wordCount++;
                }

                if (generatePDF) {
                    const wordFilePath = path.join(outputDir, `${id}.docx`);
                    const result = await convertWordToPDF(wordFilePath, id, outputDir);
                    if (result.success) {
                        pdfCount++;
                    }
                }
            } catch (error) {
                errors.push(`行 ${i + 1} (ID: ${id}): ${error.message}`);
            }
        }

        // ========== 清理上傳的文件 ==========
        try {
            fs.unlinkSync(excelPath);
            fs.unlinkSync(wordPath);
        } catch (e) {}

        res.json({
            success: true,
            totalFiles: wordCount + pdfCount,
            wordCount,
            pdfCount,
            totalRecords: data.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: '伺服器錯誤: ' + error.message });
    }
});

/**
 * GET /api/download-zip - 下載所有生成的文件作為 ZIP
 */
app.get('/api/download-zip', (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="generated_files.zip"');

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);

        const files = fs.readdirSync(outputDir);
        
        if (files.length === 0) {
            return res.status(400).json({ message: '沒有生成任何檔案' });
        }

        files.forEach(file => {
            const filePath = path.join(outputDir, file);
            archive.file(filePath, { name: file });
        });

        archive.finalize();

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'ZIP 打包失敗: ' + error.message });
    }
});

// ==================== 錯誤處理 ====================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '伺服器錯誤: ' + err.message });
});

// ==================== 啟動服務器 ====================
app.listen(PORT, () => {
    console.log(`✓ 伺服器運行在 http://localhost:${PORT}`);
    console.log(`✓ 打開瀏覽器訪問: http://localhost:${PORT}`);
    console.log(`✓ PDF 轉換功能: ${isLibreOfficeAvailable() ? '✓ 可用' : '✗ 不可用'}`);
});
