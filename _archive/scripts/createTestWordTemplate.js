const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

/**
 * 创建测试Word表单模板
 * 包含所有CSV字段的占位符
 */
async function createTestWordTemplate() {
  const outputPath = path.join(__dirname, 'public', 'TestLaptopForm.docx');
  
  // 创建一个基础的Word文档XML内容
  const wordXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="32"/>
        </w:rPr>
        <w:t>笔记本电脑借用表</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Laptop Borrowing Form</w:t>
      </w:r>
    </w:p>

    <w:p/>

    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9000" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        </w:tblBorders>
      </w:tblPr>

      <!-- Row 1: ID -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>设备ID | Device ID</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{ID}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 2: Serial Number -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>序列号 | Serial Number</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{SN}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 3: Model -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>型号 | Model</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{Model}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 4: Manufacturer -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>制造商 | Manufacturer</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{Manufacturer}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 5: Computer Name -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>电脑名称 | Computer Name</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{ComputerName}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 6: MAC Address -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>MAC地址 | MAC Address</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{MAC}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 7: WiFi Adapter -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>WiFi适配器 | WiFi Adapter</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{WiFiAdapter}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 8: Ethernet Adapter -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>以太网适配器 | Ethernet Adapter</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{EthernetAdapter}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 9: OS Version -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>操作系统 | OS Version</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{OSVersion}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 10: CPU -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>处理器 | CPU</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{CPU}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 11: RAM -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>内存 | RAM</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{RAM}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 12: Disk Size -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>磁盘总容量 | Disk Size</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{DiskSize}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 13: Disk Free -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>可用空间 | Disk Free</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{DiskFree}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 14: Battery Status -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>电池状态 | Battery Status</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{BatteryStatus}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Row 15: Current User -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>当前用户 | Current User</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t>{{CurrentUser}}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

    </w:tbl>

    <w:p/>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="24"/>
        </w:rPr>
        <w:t>借用人信息 | Borrower Information</w:t>
      </w:r>
    </w:p>

    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9000" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        </w:tblBorders>
      </w:tblPr>

      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>借用人名字 | Name</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t></w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>部门 | Department</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t></w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>借用日期 | Borrowing Date</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t></w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>预期归还日期 | Return Date</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t></w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="D3D3D3"/>
            <w:tcW w:w="2500" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>备注 | Notes</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcW w:w="6500" w:type="dxa"/>
          <w:p>
            <w:r>
              <w:t></w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

  </w:body>
</w:document>`;

  const relXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/document" Target="word/document.xml"/>
</Relationships>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const docRelXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

  try {
    const zip = new JSZip();
    
    // 添加必要的文件结构
    zip.file('_rels/.rels', relXml);
    zip.file('[Content_Types].xml', contentTypesXml);
    zip.file('word/document.xml', wordXml);
    zip.file('word/_rels/document.xml.rels', docRelXml);

    // 生成DOCX文件
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✓ Word测试表单已创建: ${outputPath}`);
    console.log(`\n表单包含的字段占位符:`);
    console.log('  • {{ID}} - 设备ID');
    console.log('  • {{SN}} - 序列号');
    console.log('  • {{Model}} - 型号');
    console.log('  • {{Manufacturer}} - 制造商');
    console.log('  • {{ComputerName}} - 电脑名称');
    console.log('  • {{MAC}} - MAC地址');
    console.log('  • {{WiFiAdapter}} - WiFi适配器');
    console.log('  • {{EthernetAdapter}} - 以太网适配器');
    console.log('  • {{OSVersion}} - 操作系统');
    console.log('  • {{CPU}} - 处理器');
    console.log('  • {{RAM}} - 内存');
    console.log('  • {{DiskSize}} - 磁盘总容量');
    console.log('  • {{DiskFree}} - 可用空间');
    console.log('  • {{BatteryStatus}} - 电池状态');
    console.log('  • {{CurrentUser}} - 当前用户');
    console.log('\n接下来的步骤:');
    console.log('1. 在浏览器打开 http://localhost:3000');
    console.log('2. 第一步: 定义字段 (使用上面列出的字段名)');
    console.log('3. 第二步: 上传 LaptopInventory.csv');
    console.log('4. 第三步: 上传 TestLaptopForm.docx');
    console.log('5. 第四步: 点击生成表单');
    
  } catch (error) {
    console.error('❌ 创建Word表单失败:', error.message);
  }
}

createTestWordTemplate();
