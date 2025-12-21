/**
 * AutoCreateForm - CSV整合測試自動化腳本
 * 驗證CSV數據和Word模板是否正確配置
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateCSV() {
  log('\n📋 檢查CSV文件...', 'blue');
  
  const csvPath = path.join(__dirname, 'tools', 'LaptopInventory.csv');
  
  if (!fs.existsSync(csvPath)) {
    log('❌ CSV文件未找到: ' + csvPath, 'red');
    return false;
  }

  try {
    const workbook = XLSX.readFile(csvPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      log('❌ CSV文件為空', 'red');
      return false;
    }

    log(`✅ CSV文件有效 (${data.length} 筆記錄)`, 'green');
    
    // 驗證字段
    const requiredFields = [
      'ID', 'SN', 'Model', 'Manufacturer', 'ComputerName',
      'MAC', 'WiFiAdapter', 'EthernetAdapter', 'OSVersion',
      'OSBuild', 'InstallDate', 'CPU', 'RAM', 'DiskSize',
      'DiskFree', 'BatteryStatus', 'BatteryHealth', 'CurrentUser', 'Domain'
    ];

    const actualFields = Object.keys(data[0]);
    log(`   字段數: ${actualFields.length}/${requiredFields.length}`, 'blue');
    
    const missingFields = requiredFields.filter(f => !actualFields.includes(f));
    if (missingFields.length > 0) {
      log(`   ⚠️  缺少字段: ${missingFields.join(', ')}`, 'yellow');
    }

    // 顯示第一筆記錄
    log('\n   第一筆記錄示例:', 'blue');
    Object.entries(data[0]).forEach(([key, value]) => {
      const displayValue = String(value).substring(0, 50) + (String(value).length > 50 ? '...' : '');
      log(`      ${key}: ${displayValue}`, 'blue');
    });

    return true;
  } catch (error) {
    log('❌ CSV讀取失敗: ' + error.message, 'red');
    return false;
  }
}

function validateWordTemplate() {
  log('\n📄 檢查Word模板...', 'blue');
  
  const wordPath = path.join(__dirname, 'public', 'TestLaptopForm.docx');
  
  if (!fs.existsSync(wordPath)) {
    log('❌ Word模板未找到: ' + wordPath, 'red');
    return false;
  }

  try {
    const stats = fs.statSync(wordPath);
    log(`✅ Word模板存在 (${(stats.size / 1024).toFixed(2)} KB)`, 'green');

    // 驗證DOCX結構 (簡單檢查)
    // DOCX是ZIP文件,應該包含特定的文件
    const JSZip = require('jszip');
    const buffer = fs.readFileSync(wordPath);
    
    return new Promise((resolve) => {
      JSZip.loadAsync(buffer).then(zip => {
        const hasDocument = zip.file('word/document.xml');
        const hasRels = zip.file('_rels/.rels');
        
        if (hasDocument && hasRels) {
          log('   ✅ DOCX結構有效', 'green');
          
          // 提取並檢查占位符
          hasDocument.async('string').then(content => {
            const placeholders = content.match(/\{[A-Za-z_]+\}/g) || [];
            const uniquePlaceholders = [...new Set(placeholders)];
            
            if (uniquePlaceholders.length > 0) {
              log(`   ✅ 找到 ${uniquePlaceholders.length} 個占位符:`, 'green');
              uniquePlaceholders.forEach(ph => {
                log(`      ${ph}`, 'blue');
              });
            } else {
              log('   ⚠️  未找到占位符', 'yellow');
            }
            resolve(true);
          });
        } else {
          log('   ❌ DOCX結構無效', 'red');
          resolve(false);
        }
      }).catch(err => {
        log('   ❌ DOCX讀取失敗: ' + err.message, 'red');
        resolve(false);
      });
    });
  } catch (error) {
    log('❌ Word模板檢查失敗: ' + error.message, 'red');
    return false;
  }
}

function validateFieldMapping() {
  log('\n🔗 檢查字段映射...', 'blue');
  
  const csvPath = path.join(__dirname, 'tools', 'LaptopInventory.csv');
  const wordPath = path.join(__dirname, 'public', 'TestLaptopForm.docx');
  
  if (!fs.existsSync(csvPath) || !fs.existsSync(wordPath)) {
    log('❌ CSV或Word文件缺失,跳過映射檢查', 'red');
    return false;
  }

  try {
    // 讀取CSV字段
    const workbook = XLSX.readFile(csvPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const csvFields = Object.keys(data[0]);

    // 讀取Word占位符
    const JSZip = require('jszip');
    const buffer = fs.readFileSync(wordPath);

    return new Promise((resolve) => {
      JSZip.loadAsync(buffer).then(zip => {
        const docFile = zip.file('word/document.xml');
        docFile.async('string').then(content => {
          const placeholders = content.match(/\{[A-Za-z_]+\}/g) || [];
          const uniquePlaceholders = [...new Set(placeholders)]
            .map(p => p.slice(1, -1)) // 去掉花括號
            .filter(p => p !== ''); // 移除空占位符

          // 比較
          const missingInCSV = uniquePlaceholders.filter(p => !csvFields.includes(p));
          const unusedInTemplate = csvFields.filter(f => !uniquePlaceholders.includes(f));

          if (missingInCSV.length === 0 && unusedInTemplate.length === 0) {
            log('✅ 字段映射完全匹配', 'green');
          } else {
            if (missingInCSV.length > 0) {
              log(`⚠️  模板中有Word模板中但CSV中沒有的字段: ${missingInCSV.join(', ')}`, 'yellow');
            }
            if (unusedInTemplate.length > 0) {
              log(`ℹ️  CSV中有但Word模板中沒有使用的字段: ${unusedInTemplate.join(', ')}`, 'blue');
            }
          }

          resolve(true);
        });
      });
    });
  } catch (error) {
    log('❌ 字段映射檢查失敗: ' + error.message, 'red');
    return false;
  }
}

function checkServerRunning() {
  log('\n🚀 檢查伺服器...', 'blue');
  
  const http = require('http');
  
  return new Promise((resolve) => {
    const request = http.get('http://localhost:3000', (response) => {
      if (response.statusCode === 200) {
        log('✅ 伺服器運行正常 (http://localhost:3000)', 'green');
        resolve(true);
      } else {
        log(`⚠️  伺服器響應代碼: ${response.statusCode}`, 'yellow');
        resolve(true);
      }
    });

    request.on('error', (error) => {
      log('❌ 無法連接到伺服器: ' + error.message, 'red');
      log('   提示: 運行 npm start 啟動伺服器', 'yellow');
      resolve(false);
    });
  });
}

async function runValidation() {
  log('\n' + '='.repeat(60), 'bold');
  log('🎯 AutoCreateForm - CSV整合驗證', 'bold');
  log('='.repeat(60) + '\n', 'bold');

  // 按順序執行驗證
  const csvValid = validateCSV();
  const wordValid = await validateWordTemplate();
  const mappingValid = await validateFieldMapping();
  const serverRunning = await checkServerRunning();

  // 總結
  log('\n' + '='.repeat(60), 'bold');
  log('📊 驗證總結:', 'bold');
  log('='.repeat(60), 'bold');
  
  log(`CSV文件:        ${csvValid ? '✅ 有效' : '❌ 無效'}`, csvValid ? 'green' : 'red');
  log(`Word模板:       ${wordValid ? '✅ 有效' : '❌ 無效'}`, wordValid ? 'green' : 'red');
  log(`字段映射:       ${mappingValid ? '✅ 匹配' : '⚠️  警告'}`, mappingValid ? 'green' : 'yellow');
  log(`伺服器:         ${serverRunning ? '✅ 運行中' : '❌ 離線'}`, serverRunning ? 'green' : 'red');

  if (csvValid && wordValid && serverRunning) {
    log('\n✅ 所有檢查通過! 可以開始整合測試。', 'green');
    log('\n📖 請遵循 CSV_INTEGRATION_GUIDE.md 中的步驟。\n', 'green');
  } else {
    log('\n⚠️  請修復上述問題後重試。\n', 'yellow');
  }
}

runValidation().catch(err => {
  log('❌ 驗證過程出錯: ' + err.message, 'red');
  process.exit(1);
});
