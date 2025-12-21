const fs = require('fs');
const path = require('path');

// CSV parser function with proper quote handling
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            // Handle escaped quotes
            if (insideQuotes && nextChar === '"') {
                current += '"';
                i++; // skip next quote
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add the last field
    result.push(current);
    
    return result;
}

// Test with both CSV files
console.log('\n=== Testing CSV Parsing ===\n');

// Test 1: Original CSV with quotes
console.log('Testing LaptopInventory_Fixed.csv:');
let csvContent = fs.readFileSync(path.join(__dirname, 'tools/LaptopInventory_Fixed.csv'), 'utf-8');
csvContent = csvContent.replace(/^\uFEFF/, '');
let lines = csvContent.split('\n').filter(line => line.trim());
let headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
console.log('Headers:', headers);
console.log('First header raw:', lines[0].split(',')[0]);
console.log('First header cleaned:', headers[0]);

// Test 2: Clean CSV
console.log('\nTesting LaptopInventory_Clean.csv:');
csvContent = fs.readFileSync(path.join(__dirname, 'tools/LaptopInventory_Clean.csv'), 'utf-8');
csvContent = csvContent.replace(/^\uFEFF/, '');
lines = csvContent.split('\n').filter(line => line.trim());
headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
console.log('Headers:', headers);
console.log('First header raw:', lines[0].split(',')[0]);
console.log('First header cleaned:', headers[0]);

// Test 3: Parse data row
console.log('\nTesting data row parsing:');
const dataLine = lines[1];
const values = parseCSVLine(dataLine);
console.log('Values count:', values.length);
console.log('Headers count:', headers.length);
const row = {};
headers.forEach((header, index) => {
    const value = (values[index] || '').trim().replace(/^"|"$/g, '');
    row[header] = value;
});
console.log('Parsed row:', JSON.stringify(row, null, 2));
console.log('ID field value:', row['ID']);
console.log('\n✓ CSV parsing test complete');
