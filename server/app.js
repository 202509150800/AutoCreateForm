const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const JSZip = require('jszip');
const archiver = require('archiver');
const { execSync } = require('child_process');
// LibreOffice 路徑（如果自動找不到）
process.env.PATH = 'C:\\Program Files\\LibreOffice\\program;' + process.env.PATH;
const app = express();
const PORT = process.env.PORT || 3000;

// Setup directories
const uploadDir = path.join(__dirname, '../uploads');
const outputDir = path.join(__dirname, '../output');
const tempDir = path.join(__dirname, '../temp');

[uploadDir, outputDir, tempDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configure multer
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

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API: Generate files
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

        if (!req.files.excelFile || !req.files.wordFile) {
            return res.status(400).json({ message: '缺少必要的檔案' });
        }

        const excelPath = req.files.excelFile[0].path;
        const wordPath = req.files.wordFile[0].path;

        // Read Excel file
        let data = [];
        try {
            const workbook = XLSX.readFile(excelPath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            data = XLSX.utils.sheet_to_json(sheet);
        } catch (error) {
            return res.status(400).json({ message: 'Excel 檔案讀取失敗: ' + error.message });
        }

        if (data.length === 0) {
            return res.status(400).json({ message: 'Excel 檔案無資料' });
        }

        // Debug: log actual column names from Excel
        const actualColumns = Object.keys(data[0]);
        console.log('📊 Excel 欄位名稱:', actualColumns);
        console.log('📊 第一行資料:', data[0]);

        // Find ID column (case-insensitive)
        const idField = Object.keys(data[0]).find(key => key.toLowerCase() === 'id');
        if (!idField) {
            return res.status(400).json({ message: 'Excel 必須包含 ID 欄位' });
        }

        let wordCount = 0;
        let pdfCount = 0;
        const errors = [];

        // Process each row
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const id = row[idField];

            if (!id) continue;

            try {
                if (generateWord) {
                    await createWordDocument(wordPath, row, id, columnsList);
                    wordCount++;
                }

                if (generatePDF) {
                    const wordFilePath = path.join(outputDir, `${id}.docx`);
                    await convertWordToPDF(wordFilePath, id);
                    pdfCount++;
                }
            } catch (error) {
                errors.push(`行 ${i + 1} (ID: ${id}): ${error.message}`);
            }
        }

        // Clean up uploaded files
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

// Create Word document by replacing placeholders
async function createWordDocument(templatePath, data, id, columnsList = []) {
    return new Promise(async (resolve, reject) => {
        try {
            const outputPath = path.join(outputDir, `${id}.docx`);
            
            // Read template as zip
            const templateBuffer = fs.readFileSync(templatePath);
            const zip = new JSZip();
            
            const templateZip = await zip.loadAsync(templateBuffer);
            
            // Get document.xml
            let documentXml = await templateZip.file('word/document.xml').async('string');
            
            // First, clean up Word's XML formatting that might split placeholders
            // Remove XML tags between { and } to reconstruct placeholders
            // This handles cases where Word splits {Broad} into {</w:t>...</w:t>Broad</w:t>...</w:t>}
            documentXml = documentXml.replace(/\{(<[^>]*>)*([^}<]+)(<[^>]*>)*\}/g, (match) => {
                // Extract just the text content between { and }
                const textOnly = match.replace(/<[^>]*>/g, '');
                return textOnly;
            });
            
            // Replace placeholders: {fieldName} with value (single braces)
            // Only replace fields that are in columnsList (if provided)
            const fieldsToReplace = columnsList && columnsList.length > 0 ? columnsList : Object.keys(data);
            
            console.log(`🔄 替換欄位 (ID: ${id}):`, fieldsToReplace);
            
            fieldsToReplace.forEach(key => {
                const placeholder = `{${key}}`;
                // Escape special regex characters in the placeholder itself
                const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedPlaceholder, 'g');
                const value = String(data[key] || '');
                // Escape special characters in replacement value
                const escapedValue = value.replace(/\$/g, '$$$$');
                documentXml = documentXml.replace(regex, escapedValue);
            });
            
            // Update document.xml in zip
            templateZip.file('word/document.xml', documentXml);
            
            // Write output file
            const outputBuffer = await templateZip.generateAsync({ type: 'nodebuffer' });
            fs.writeFileSync(outputPath, outputBuffer);
            
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// Convert Word to PDF using LibreOffice
async function convertWordToPDF(wordPath, id) {
    return new Promise((resolve, reject) => {
        try {
            const outputPath = path.join(outputDir, `${id}.pdf`);
            
            // Check if LibreOffice is available
            try {
                execSync('soffice --version', { stdio: 'pipe' });
            } catch (e) {
                console.warn('LibreOffice not available, skipping PDF conversion');
                resolve();
                return;
            }

            // Convert using LibreOffice
            const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${wordPath}"`;
            
            execSync(command, { stdio: 'pipe' });
            
            resolve();
        } catch (error) {
            console.warn(`PDF conversion failed: ${error.message}`);
            resolve(); // Don't reject, just skip PDF
        }
    });
}

// API: Download all files as ZIP
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '伺服器錯誤: ' + err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ 伺服器運行在 http://localhost:${PORT}`);
    console.log(`✓ 打開瀏覽器訪問: http://localhost:${PORT}`);
});
