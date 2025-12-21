#!/usr/bin/env node

/**
 * End-to-End Integration Test for CSV Form Generation
 * 测试完整的 CSV 到 Word 表单生成工作流
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const API_URL = 'http://localhost:3000/api/generate';
const csvFile = path.join(__dirname, 'tools/LaptopInventory_Clean.csv');
const wordFile = path.join(__dirname, 'public/TestLaptopForm.docx');

console.log('\n╔════════════════════════════════════════╗');
console.log('║  CSV Form Generation - E2E Test      ║');
console.log('╚════════════════════════════════════════╝\n');

// Verify files exist
console.log('📋 检查必要文件...');
let filesOK = true;

if (!fs.existsSync(csvFile)) {
    console.log(`❌ CSV 文件不存在: ${csvFile}`);
    filesOK = false;
} else {
    console.log(`✓ CSV 文件: ${path.basename(csvFile)}`);
}

if (!fs.existsSync(wordFile)) {
    console.log(`❌ Word 文件不存在: ${wordFile}`);
    filesOK = false;
} else {
    console.log(`✓ Word 文件: ${path.basename(wordFile)}`);
}

if (!filesOK) {
    console.log('\n❌ 必要文件缺失，无法测试');
    process.exit(1);
}

// Prepare test data
console.log('\n📝 准备测试数据...');

// Read CSV to extract field names
const csvContent = fs.readFileSync(csvFile, 'utf-8');
const headerLine = csvContent.split('\n')[0];
const fields = headerLine
    .split(',')
    .map(h => h.trim().replace(/^"|"$/g, ''));

console.log(`✓ 字段数: ${fields.length}`);
console.log(`✓ 字段: ${fields.join(', ')}`);

// Create a simple multipart form data manually
const boundary = '----WebKitFormBoundary' + Date.now();
let body = '';

// Add fields
body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="columns"\r\n\r\n`;
body += JSON.stringify(fields) + '\r\n';

body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="generateWord"\r\n\r\n`;
body += 'true\r\n';

body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="generatePDF"\r\n\r\n`;
body += 'false\r\n';

// Add CSV file
body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="excelFile"; filename="LaptopInventory_Clean.csv"\r\n`;
body += `Content-Type: text/csv\r\n\r\n`;

const csvData = fs.readFileSync(csvFile);
const csvBody = body + csvData.toString('binary') + `\r\n--${boundary}\r\n`;

// Add Word file
let wordBody = csvBody;
wordBody += `Content-Disposition: form-data; name="wordFile"; filename="TestLaptopForm.docx"\r\n`;
wordBody += `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`;

const wordData = fs.readFileSync(wordFile);
const finalBody = wordBody + wordData.toString('binary') + `\r\n--${boundary}--\r\n`;

console.log('\n🚀 发送请求到 API...');
console.log(`📍 API 地址: ${API_URL}`);
console.log(`📦 表单数据：`);
console.log(`  - Excel/CSV: LaptopInventory_Clean.csv`);
console.log(`  - Word 模板: TestLaptopForm.docx`);
console.log(`  - 字段列表: ${fields.length} 个字段`);

// Parse URL and create request
const url = new URL(API_URL);
const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(finalBody)
    }
};

const req = http.request(options, (res) => {
    console.log(`\n📥 接收到响应 (状态码: ${res.statusCode})`);

    let responseData = '';
    const chunks = [];
    
    res.on('data', chunk => {
        chunks.push(chunk);
        responseData += chunk.toString('utf8', 0, Math.min(chunk.length, 500)); // Only show first 500 chars
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            // Success - we got a ZIP file
            console.log('\n✅ API 返回成功！');
            
            // Check response headers
            const contentType = res.headers['content-type'];
            const disposition = res.headers['content-disposition'];
            
            console.log(`\n📊 响应信息：`);
            console.log(`  Content-Type: ${contentType}`);
            if (disposition) {
                console.log(`  Content-Disposition: ${disposition}`);
            }
            
            // Save the ZIP file
            const outputZip = path.join(__dirname, 'output/test-output.zip');
            const allChunks = Buffer.concat(chunks);
            fs.writeFileSync(outputZip, allChunks);
            
            console.log(`\n💾 下载完成！`);
            console.log(`📁 文件保存: ${outputZip}`);
            
            const fileSize = fs.statSync(outputZip).size;
            console.log(`📏 文件大小: ${(fileSize / 1024).toFixed(2)} KB`);
            
            console.log('\n✨ 测试完成！');
            process.exit(0);
        } else {
            // Error response
            console.log('\n❌ API 返回错误！');
            
            try {
                const errorData = JSON.parse(responseData);
                console.log(`\n错误信息：`);
                console.log(JSON.stringify(errorData, null, 2));
            } catch (e) {
                console.log(`\n原始响应：`);
                console.log(responseData);
            }
            
            process.exit(1);
        }
    });
});

req.on('error', (err) => {
    console.log(`\n❌ 请求错误: ${err.message}`);
    process.exit(1);
});

// Write the body
req.write(finalBody, 'binary');
req.end();
