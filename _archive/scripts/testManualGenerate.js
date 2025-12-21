#!/usr/bin/env node

/**
 * 手动测试脚本 - 发送完整的表单数据
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const csvFile = path.join(__dirname, 'tools/LaptopInventory_Clean.csv');
const wordFile = path.join(__dirname, 'public/TestLaptopForm.docx');

const fields = [
    'ID', 'SN', 'Model', 'Manufacturer', 'ComputerName',
    'MAC', 'WiFiAdapter', 'EthernetAdapter', 'OSVersion', 'OSBuild',
    'InstallDate', 'CPU', 'RAM', 'DiskSize', 'DiskFree',
    'BatteryStatus', 'BatteryHealth', 'CurrentUser', 'Domain'
];

console.log('\n📝 准备测试表单数据...');
console.log('CSV 文件:', csvFile);
console.log('Word 文件:', wordFile);
console.log('字段数:', fields.length);
console.log('字段:', fields.join(', '));

const boundary = '----TestBoundary' + Date.now();
let body = '';

// Add columns field
body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="columns"\r\n\r\n`;
body += JSON.stringify(fields) + '\r\n';

// Add generateWord field
body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="generateWord"\r\n\r\n`;
body += 'true\r\n';

// Add generatePDF field
body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="generatePDF"\r\n\r\n`;
body += 'true\r\n';

// Add excelFile
body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="excelFile"; filename="LaptopInventory_Clean.csv"\r\n`;
body += `Content-Type: text/csv\r\n\r\n`;

const csvData = fs.readFileSync(csvFile);
body += csvData.toString('binary') + `\r\n`;

// Add wordFile
body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="wordFile"; filename="TestLaptopForm.docx"\r\n`;
body += `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`;

const wordData = fs.readFileSync(wordFile);
body += wordData.toString('binary') + `\r\n`;

body += `--${boundary}--\r\n`;

console.log('\n📤 发送请求到 API...');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body)
    }
};

const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', chunk => {
        responseData += chunk.toString('utf8', 0, Math.min(chunk.length, 1000));
    });
    
    res.on('end', () => {
        console.log(`\n✓ 状态码: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
            try {
                const result = JSON.parse(responseData);
                console.log('\n✅ 生成成功！');
                console.log('结果:', result);
            } catch (e) {
                console.log('响应数据:', responseData.substring(0, 500));
            }
        } else {
            console.log('\n❌ 生成失败！');
            console.log('错误:', responseData);
        }
        
        process.exit(res.statusCode === 200 ? 0 : 1);
    });
});

req.on('error', (err) => {
    console.error('\n❌ 请求错误:', err.message);
    console.error('错误代码:', err.code);
    console.error('详情:', err);
    process.exit(1);
});

req.write(body, 'binary');
req.end();
