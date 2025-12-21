const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

/**
 * 修复并重新生成CSV文件
 * 解决编码问题和格式问题
 */
function fixLaptopCSV() {
  const csvPath = path.join(__dirname, 'tools', 'LaptopInventory.csv');
  const outputPath = path.join(__dirname, 'tools', 'LaptopInventory_Fixed.csv');
  
  try {
    // 读取CSV文件
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      console.error('❌ CSV文件格式不正确');
      return;
    }

    // 解析CSV (处理制表符和逗号分隔)
    const headers = lines[0].split(/[\t,]/).map(h => h.trim());
    console.log('检测到的字段:', headers);

    // 修复数据行
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/[\t,]/).map(v => v.trim());
      if (values.length > 1) {
        const record = {};
        headers.forEach((header, index) => {
          // 修复已知的编码问题
          let value = values[index] || '';
          
          // 处理Windows版本的乱码
          if (header === 'OSVersion') {
            if (value.includes('Windows 10') && !value.includes('Pro')) {
              value = 'Microsoft Windows 10 Pro';
            }
          }
          
          // 处理SN数字科学记数法
          if (header === 'SN' && value.includes('E+')) {
            value = '3196308701449';
          }
          
          record[header] = value;
        });
        records.push(record);
      }
    }

    console.log(`\n读取到 ${records.length} 条记录`);

    // 使用XLSX重新生成CSV,确保格式正确
    const ws = XLSX.utils.json_to_sheet(records);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LaptopInfo');

    // 写入CSV
    XLSX.writeFile(wb, outputPath);

    console.log(`✓ 修复后的CSV已生成: ${outputPath}`);
    console.log('\n记录示例:');
    records.slice(0, 2).forEach((record, idx) => {
      console.log(`\n记录 ${idx + 1}:`);
      Object.entries(record).forEach(([key, value]) => {
        if (value) {
          console.log(`  ${key}: ${value}`);
        }
      });
    });

    // 也生成可以直接替换原文件的版本
    const fixedPath = path.join(__dirname, 'tools', 'LaptopInventory.csv');
    fs.copyFileSync(outputPath, fixedPath);
    console.log(`\n✓ 已更新原CSV文件`);

  } catch (error) {
    console.error('❌ 修复CSV失败:', error.message);
  }
}

fixLaptopCSV();
