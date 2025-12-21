const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');

async function inspectDocx() {
    try {
        const filePath = path.join(__dirname, 'public', 'TestLaptopForm.docx');
        if (!fs.existsSync(filePath)) {
            console.log('File not found:', filePath);
            return;
        }
        
        const content = fs.readFileSync(filePath);
        const zip = await JSZip.loadAsync(content);
        const docXml = await zip.file('word/document.xml').async('string');
        
        console.log('Length of document.xml:', docXml.length);
        console.log('Snippet containing "ID":');
        
        const index = docXml.indexOf('ID');
        if (index !== -1) {
            console.log(docXml.substring(Math.max(0, index - 100), Math.min(docXml.length, index + 100)));
        } else {
            console.log('"ID" not found in XML');
        }

        console.log('\nSnippet containing "{":');
        const braceIndex = docXml.indexOf('{');
        if (braceIndex !== -1) {
            console.log(docXml.substring(Math.max(0, braceIndex - 50), Math.min(docXml.length, braceIndex + 100)));
        } else {
            console.log('"{" not found in XML');
        }

    } catch (e) {
        console.error(e);
    }
}

inspectDocx();