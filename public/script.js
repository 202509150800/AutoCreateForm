let excelFileData = null;
let wordFileData = null;
let columns = ['ID'];  // Start with ID

// Add new column
function addColumn() {
    const input = document.getElementById('newColumnInput');
    const columnName = input.value.trim();

    if (!columnName) {
        alert('請輸入欄位名稱');
        return;
    }

    if (columns.includes(columnName)) {
        alert('欄位已存在：' + columnName);
        return;
    }

    columns.push(columnName);
    input.value = '';
    renderColumns();
}

// Render columns
function renderColumns() {
    const container = document.getElementById('columnsContainer');
    container.innerHTML = '';

    columns.forEach((col, index) => {
        const div = document.createElement('div');
        div.className = 'column-item';
        
        if (col === 'ID') {
            div.innerHTML = `
                <input type="text" class="column-input" value="${col}" disabled>
                <button class="btn-small" disabled>✓</button>
            `;
        } else {
            div.innerHTML = `
                <input type="text" class="column-input" value="${col}" disabled>
                <button class="btn-small" onclick="removeColumn(${index})">✕</button>
            `;
        }
        
        container.appendChild(div);
    });
}

// Remove column
function removeColumn(index) {
    columns.splice(index, 1);
    renderColumns();
}

// Handle file drag and drop
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

function handleDrop(event, type) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        if (type === 'excel') {
            document.getElementById('excelFile').files = files;
            handleExcelUpload();
        } else if (type === 'word') {
            document.getElementById('wordFile').files = files;
            handleWordUpload();
        }
    }
}

// Handle Excel upload
function handleExcelUpload() {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];

    if (file) {
        const fileName = file.name;
        document.getElementById('excelFileName').textContent = `✓ 已選擇: ${fileName}`;
        document.getElementById('excelFileName').classList.add('show');

        // Read file
        const reader = new FileReader();
        reader.onload = (e) => {
            excelFileData = e.target.result;
            
            // Preview data
            try {
                const XLSX = window.XLSX;
                if (!XLSX) {
                    // XLSX library not loaded yet, load from CDN
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.min.js';
                    script.onload = () => previewExcelData();
                    document.head.appendChild(script);
                } else {
                    previewExcelData();
                }
            } catch (err) {
                console.error('Preview error:', err);
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

// Preview Excel data
function previewExcelData() {
    try {
        const workbook = XLSX.read(excelFileData, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        if (data.length > 0) {
            const previewDiv = document.getElementById('previewContainer');
            const previewTable = document.getElementById('previewTable');

            // Create table
            let html = '<table><thead><tr>';
            Object.keys(data[0]).forEach(key => {
                html += `<th>${key}</th>`;
            });
            html += '</tr></thead><tbody>';

            // Show first 3 rows
            for (let i = 0; i < Math.min(3, data.length); i++) {
                html += '<tr>';
                Object.keys(data[0]).forEach(key => {
                    html += `<td>${data[i][key] || ''}</td>`;
                });
                html += '</tr>';
            }

            if (data.length > 3) {
                html += `<tr><td colspan="${Object.keys(data[0]).length}" style="text-align: center; color: #999;">... 還有 ${data.length - 3} 筆資料</td></tr>`;
            }

            html += '</tbody></table>';
            previewTable.innerHTML = html;
            previewDiv.style.display = 'block';
        }
    } catch (err) {
        console.error('Error previewing data:', err);
    }
}

// Handle Word upload
function handleWordUpload() {
    const fileInput = document.getElementById('wordFile');
    const file = fileInput.files[0];

    if (file) {
        const fileName = file.name;
        document.getElementById('wordFileName').textContent = `✓ 已選擇: ${fileName}`;
        document.getElementById('wordFileName').classList.add('show');

        // Read file
        const reader = new FileReader();
        reader.onload = (e) => {
            wordFileData = e.target.result;
        };
        reader.readAsArrayBuffer(file);
    }
}

// Generate files
async function generateFiles() {
    if (!excelFileData || !wordFileData) {
        alert('請先上傳 Excel 和 Word 檔案');
        return;
    }

    if (columns.length < 2) {
        alert('請至少定義 2 個欄位 (ID + 至少 1 個其他欄位)');
        return;
    }

    const generatePDF = document.getElementById('generatePDF').checked;
    const generateWord = document.getElementById('generateWord').checked;

    if (!generatePDF && !generateWord) {
        alert('請選擇至少一個生成選項');
        return;
    }

    // Show progress section
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';

    const formData = new FormData();
    formData.append('excelFile', new Blob([excelFileData]), 'data.xlsx');
    formData.append('wordFile', new Blob([wordFileData]), 'template.docx');
    formData.append('generatePDF', generatePDF);
    formData.append('generateWord', generateWord);
    formData.append('columns', JSON.stringify(columns));

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            showResults(result);
        } else {
            const error = await response.json();
            alert('生成失敗: ' + error.message);
            document.getElementById('progressSection').style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('發生錯誤: ' + error.message);
        document.getElementById('progressSection').style.display = 'none';
    }
}

// Show results
function showResults(result) {
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';

    const summary = `
        ✅ 成功生成 ${result.totalFiles} 個檔案:
        <br>• Word 檔案: ${result.wordCount} 個
        <br>• PDF 檔案: ${result.pdfCount} 個
        <br>• 處理記錄: ${result.totalRecords} 筆
    `;

    document.getElementById('resultSummary').innerHTML = summary;
}

// Download all files as ZIP
async function downloadAll() {
    try {
        const response = await fetch('/api/download-zip');
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'generated_files.zip';
            link.click();
            URL.revokeObjectURL(url);
        } else {
            alert('下載失敗');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('下載出錯: ' + error.message);
    }
}

// Add drag-leave handler to upload areas
document.addEventListener('DOMContentLoaded', function() {
    const uploadAreas = document.querySelectorAll('.upload-area');
    uploadAreas.forEach(area => {
        area.addEventListener('dragleave', handleDragLeave);
        area.addEventListener('click', function() {
            const inputId = this.id === 'excelUpload' ? 'excelFile' : 'wordFile';
            document.getElementById(inputId).click();
        });
    });

    // Initial column render
    renderColumns();

    // Add column on Enter key
    document.getElementById('newColumnInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addColumn();
        }
    });

    // Load XLSX library
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.min.js';
    document.head.appendChild(script);
});
