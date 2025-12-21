/**
 * AutoCreateForm Frontend Script
 * 
 * 提供批量生成 Word 和 PDF 文檔的用戶界面和邏輯
 * 
 * @module script.js
 * @description
 * 主要功能:
 * - 欄位管理（添加、刪除欄位）
 * - 文件上傳（Excel/CSV、Word 模板）
 * - 數據預覽
 * - 批量文檔生成
 * - 文件下載
 * 
 * @requires xlsx - Excel 文件解析（可選，用於預覽）
 */

// ============================================================================
// 全局變數 - Global Variables
// ============================================================================

/** @type {ArrayBuffer|string|null} Excel/CSV 文件的二進制數據 */
let excelFileData = null;

/** @type {ArrayBuffer|null} Word 模板文件的二進制數據 */
let wordFileData = null;

/** @type {string|null} 上傳的 Excel/CSV 文件原始名稱 */
let excelFileName = null;

/** @type {string|null} 上傳的 Word 文件原始名稱 */
let wordFileName = null;

/** @type {Array<string>} 要替換的欄位列表，始終以 'ID' 開頭 */
let columns = ['ID'];

/** @type {boolean} XLSX 庫加載狀態標記 */
let XLSX_LOADED = false;

// ============================================================================
// 初始化 - Initialization
// ============================================================================

/**
 * 預先加載 XLSX 庫，使用兩個備用源確保加載成功
 * - 主源: jsDelivr CDN
 * - 備用源: unpkg
 * 
 * 如果加載失敗，應用仍可正常工作，但 Excel 預覽功能將被禁用
 * 
 * @function
 * @returns {void}
 * @example
 * // 自動在頁面加載時運行
 * // 無需手動調用
 */
(function() {
    if (typeof XLSX === 'undefined') {
        const script = document.createElement('script');
        // Try jsDelivr CDN as primary source
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.min.js';
        script.onload = () => {
            XLSX_LOADED = true;
            console.log('✓ XLSX 庫已加載');
        };
        script.onerror = () => {
            console.warn('⚠️ 無法從 jsDelivr 加載 XLSX，嘗試備用源...');
            // Fallback to unpkg
            const fallbackScript = document.createElement('script');
            fallbackScript.src = 'https://unpkg.com/xlsx@0.18.5/dist/xlsx.min.js';
            fallbackScript.onload = () => {
                XLSX_LOADED = true;
                console.log('✓ XLSX 庫已加載 (備用源)');
            };
            fallbackScript.onerror = () => {
                console.warn('⚠️ XLSX 庫加載失敗，將使用簡化模式');
                // XLSX loading failed, but we can still handle CSV manually
            };
            document.head.appendChild(fallbackScript);
        };
        document.head.appendChild(script);
    } else {
        XLSX_LOADED = true;
    }
})();

// ============================================================================
// 欄位管理 - Column Management Functions
// ============================================================================

/**
 * 切換輸入模式（批量模式 vs 單個輸入模式）
 * 
 * @function
 * @param {string} mode - 目標模式：'batch' 或其他（單個輸入）
 * @returns {void}
 * @example
 * // 切換到批量輸入模式
 * switchInputMode('batch');
 * 
 * // 切換到單個輸入模式
 * switchInputMode('single');
 */
function switchInputMode(mode) {
    const batchMode = document.getElementById('batchInputMode');
    const singleMode = document.getElementById('singleInputMode');
    const btns = document.querySelectorAll('.mode-btn');

    if (mode === 'batch') {
        batchMode.style.display = 'block';
        singleMode.style.display = 'none';
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else {
        batchMode.style.display = 'none';
        singleMode.style.display = 'block';
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
    }
}

/**
 * 從批量輸入文本框添加多個欄位
 * 
 * 功能:
 * - 按逗號分隔欄位名稱
 * - 自動清理前後空格
 * - 如果不是 'ID'，會自動在開頭添加 'ID' 欄位
 * - 移除重複欄位
 * - 更新欄位列表顯示
 * 
 * @function
 * @returns {void}
 * @throws {alert} 如果輸入為空或無效
 * @example
 * // HTML: <input id="batchColumnInput" value="Name, Email, Phone">
 * // <button onclick="addColumnsFromBatch()">添加</button>
 * addColumnsFromBatch();
 * // 結果: columns = ['ID', 'Name', 'Email', 'Phone']
 */
function addColumnsFromBatch() {
    const input = document.getElementById('batchColumnInput');
    const text = input.value.trim();

    if (!text) {
        alert('請輸入欄位名稱');
        return;
    }

    // Split by comma and clean up
    const newColumns = text.split(',').map(col => col.trim()).filter(col => col);

    if (newColumns.length === 0) {
        alert('請輸入有效的欄位名稱');
        return;
    }

    // Check if first column is ID
    if (newColumns[0] !== 'ID') {
        newColumns.unshift('ID');
    }

    // Remove duplicates and update columns
    columns = [...new Set(newColumns)];
    input.value = '';
    renderColumns();

    alert(`✓ 已添加 ${columns.length} 個欄位：\n${columns.join(', ')}`);
}

/**
 * 添加單個欄位到欄位列表
 * 
 * 功能:
 * - 驗證欄位名稱不為空
 * - 檢查欄位是否已存在（避免重複）
 * - 添加新欄位並更新顯示
 * 
 * @function
 * @returns {void}
 * @throws {alert} 如果欄位為空或已存在
 * @example
 * // HTML: <input id="newColumnInput" placeholder="輸入欄位名稱">
 * // <button onclick="addColumn()">添加</button>
 * // 用戶輸入: 'Email'
 * addColumn();
 * // 結果: columns 中添加 'Email'
 */
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

/**
 * 渲染欄位列表到 DOM
 * 
 * 功能:
 * - 清空現有欄位容器
 * - 為每個欄位創建 DOM 元素
 * - 'ID' 欄位禁用編輯和刪除
 * - 其他欄位允許刪除操作
 * 
 * @function
 * @returns {void}
 * @example
 * columns = ['ID', 'Name', 'Email'];
 * renderColumns();
 * // 在 #columnsContainer 中渲染三個欄位
 */
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

/**
 * 從欄位列表中移除指定索引的欄位
 * 
 * 功能:
 * - 根據索引移除欄位
 * - 重新渲染欄位列表
 * - ID 欄位無法移除（不會被調用）
 * 
 * @function
 * @param {number} index - 要移除的欄位在 columns 數組中的索引
 * @returns {void}
 * @example
 * columns = ['ID', 'Name', 'Email'];
 * removeColumn(1);  // 移除 'Name'
 * // 結果: columns = ['ID', 'Email']
 */
function removeColumn(index) {
    columns.splice(index, 1);
    renderColumns();
}

// ============================================================================
// 文件上傳 - File Upload Functions
// ============================================================================

/**
 * 處理拖放區域的 dragover 事件
 * 
 * 功能:
 * - 阻止默認拖放行為
 * - 為上傳區域添加視覺反饋（CSS 類）
 * 
 * @function
 * @param {DragEvent} event - 拖放事件對象
 * @returns {void}
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('drag-over');
}

/**
 * 處理拖放區域的 dragleave 事件
 * 
 * 功能:
 * - 移除拖放時添加的視覺反饋
 * 
 * @function
 * @param {DragEvent} event - 拖放事件對象
 * @returns {void}
 */
function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

/**
 * 處理拖放文件到上傳區域
 * 
 * 功能:
 * - 阻止默認行為
 * - 檢測文件類型（Excel 或 Word）
 * - 根據類型調用相應的上傳處理函數
 * 
 * @function
 * @param {DragEvent} event - 拖放事件對象
 * @param {string} type - 文件類型：'excel' 或 'word'
 * @returns {void}
 * @example
 * // HTML: <div ondrop="handleDrop(event, 'excel')">拖放區域</div>
 * handleDrop(dragEvent, 'excel');
 */
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

/**
 * 處理 Excel/CSV 文件上傳
 * 
 * 功能:
 * - 讀取上傳的 Excel 或 CSV 文件
 * - 根據文件類型採用不同的解析方法
 * - CSV: 使用文本解析，顯示預覽
 * - Excel: 讀取為二進制，使用 XLSX 庫解析
 * - 顯示文件名和數據預覽
 * 
 * @function
 * @returns {void}
 * @throws {alert} 如果文件讀取失敗
 * @example
 * // HTML: <input id="excelFile" type="file" onchange="handleExcelUpload()">
 * // 用戶選擇文件時自動調用
 */
function handleExcelUpload() {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];

    if (file) {
        const fileName = file.name;
        const fileExt = fileName.toLowerCase().split('.').pop();
        
        excelFileName = fileName;  // Store original filename
        
        document.getElementById('excelFileName').textContent = `✓ 已選擇: ${fileName}`;
        document.getElementById('excelFileName').classList.add('show');

        // Read file
        const reader = new FileReader();
        
        if (fileExt === 'csv') {
            // Handle CSV file
            reader.onload = (e) => {
                const csvText = e.target.result;
                excelFileData = csvText;  // Store for submission
                previewCSVData(csvText);
            };
            reader.onerror = () => {
                alert('❌ CSV 檔案讀取失敗');
            };
            reader.readAsText(file);
        } else {
            // Handle Excel file
            reader.onload = (e) => {
                excelFileData = e.target.result;
                
                // Try to preview if XLSX is available
                if (typeof XLSX !== 'undefined') {
                    try {
                        previewExcelData();
                    } catch (err) {
                        console.warn('⚠️ Excel 預覽失敗，但文件已成功加載');
                        const previewDiv = document.getElementById('previewContainer');
                        previewDiv.style.display = 'block';
                        previewDiv.innerHTML = '<div style="padding: 10px; background: #fff3cd; border-radius: 4px; color: #856404;">⚠️ 無法顯示預覽，但您可以繼續生成表單</div>';
                    }
                } else {
                    console.warn('⚠️ XLSX 庫未加載，將跳過 Excel 預覽');
                    const previewDiv = document.getElementById('previewContainer');
                    previewDiv.style.display = 'block';
                    previewDiv.innerHTML = '<div style="padding: 10px; background: #e7f3ff; border-radius: 4px; color: #0050b3;">ℹ️ 已加載 Excel 檔案（無預覽），可繼續生成表單</div>';
                }
            };
            reader.onerror = () => {
                alert('❌ Excel 檔案讀取失敗');
            };
            reader.readAsArrayBuffer(file);
        }
    }
}

/**
 * 預覽 CSV 文件內容
 * 
 * 功能:
 * - 解析 CSV 文本數據
 * - 提取標題和數據行
 * - 在 HTML 表格中顯示前 5 行
 * - 顯示記錄和欄位統計信息
 * 
 * CSV 解析支持:
 * - 雙引號包圍的字段
 * - 逗號分隔符
 * - 轉義的雙引號（"" 表示 "）
 * 
 * @function
 * @param {string} csvText - CSV 文件的文本內容
 * @returns {void}
 * @throws {alert} 如果 CSV 格式無效或為空
 * @example
 * const csvContent = 'ID,Name,Email\\n1,張三,zs@example.com\\n2,李四,ls@example.com';
 * previewCSVData(csvContent);
 */
function previewCSVData(csvText) {
    try {
        // Simple CSV parser (doesn't require XLSX)
        const lines = csvText.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            alert('❌ CSV 檔案無資料');
            return;
        }

        // Parse CSV manually
        function parseCSVLine(line) {
            const result = [];
            let current = '';
            let insideQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];
                
                if (char === '"') {
                    if (insideQuotes && nextChar === '"') {
                        current += '"';
                        i++;
                    } else {
                        insideQuotes = !insideQuotes;
                    }
                } else if (char === ',' && !insideQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        }

        const headers = parseCSVLine(lines[0]);
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            if (Object.values(row).some(v => v)) {
                data.push(row);
            }
        }

        if (data.length > 0) {
            const previewDiv = document.getElementById('previewContainer');
            const previewTable = document.getElementById('previewTable');

            // Create table
            let html = '<table style="width: 100%; border-collapse: collapse;">';
            
            // Headers
            html += '<tr style="background: #f0f0f0;">';
            headers.forEach(header => {
                html += `<th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${header}</th>`;
            });
            html += '</tr>';

            // Data rows (limit to 5)
            data.slice(0, 5).forEach(row => {
                html += '<tr>';
                headers.forEach(header => {
                    let value = row[header] || '';
                    html += `<td style="border: 1px solid #ddd; padding: 8px; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${String(value).substring(0, 50)}</td>`;
                });
                html += '</tr>';
            });
            html += '</table>';

            previewTable.innerHTML = html;
            previewDiv.style.display = 'block';

            // Show record count
            const info = document.createElement('div');
            info.id = 'previewInfo';
            info.style.cssText = 'margin-top: 10px; padding: 8px; background: #e7f3ff; color: #0050b3; border-radius: 4px;';
            info.textContent = `✓ 檢測到 ${data.length} 筆記錄，${headers.length} 個欄位`;
            
            // Remove old info if exists
            const oldInfo = previewTable.parentNode.querySelector('#previewInfo');
            if (oldInfo) oldInfo.remove();
            previewTable.parentNode.appendChild(info);
        }
    } catch (err) {
        console.error('CSV parse error:', err);
        alert('❌ CSV 檔案解析失敗: ' + err.message);
    }
}

/**
 * 預覽 Excel 文件內容（需要 XLSX 庫）
 * 
 * 功能:
 * - 使用 XLSX 庫讀取 Excel 文件
 * - 提取第一個工作表的數據
 * - 在 HTML 表格中顯示前 3 行
 * - 如果記錄超過 3 行，显示剩余記錄數
 * 
 * @function
 * @returns {void}
 * @requires XLSX - 全局 XLSX 庫必須已加載
 * @throws {alert} 如果 XLSX 未加載或數據解析失敗
 * @example
 * // 在上傳 Excel 文件後自動調用
 * excelFileData = arrayBuffer;
 * previewExcelData();
 */
function previewExcelData() {
    if (typeof XLSX === 'undefined') {
        console.warn('XLSX 庫未可用');
        return;
    }
    
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

/**
 * 處理 Word 模板文件上傳
 * 
 * 功能:
 * - 讀取上傳的 Word (.docx) 文件
 * - 存儲為二進制數據
 * - 顯示文件名
 * 
 * @function
 * @returns {void}
 * @throws {alert} 如果文件讀取失敗
 * @example
 * // HTML: <input id="wordFile" type="file" onchange="handleWordUpload()">
 * // 用戶選擇文件時自動調用
 */
function handleWordUpload() {
    const fileInput = document.getElementById('wordFile');
    const file = fileInput.files[0];

    if (file) {
        const fileName = file.name;
        wordFileName = fileName;  // Store original filename
        
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

// ============================================================================
// 生成和下載 - Generation and Download Functions
// ============================================================================

/**
 * 生成 Word 和/或 PDF 文檔
 * 
 * 功能:
 * - 驗證必要的文件和欄位配置
 * - 構建 FormData 並發送到 /api/generate 端點
 * - 顯示進度和結果
 * - 處理錯誤並提供用戶反饋
 * 
 * 驗證規則:
 * - 必須上傳 Excel/CSV 和 Word 文件
 * - 必須定義至少 2 個欄位（ID + 至少 1 個其他欄位）
 * - 必須選擇至少一個生成選項（Word 或 PDF）
 * 
 * @async
 * @function
 * @returns {Promise<void>}
 * @throws {alert} 如果驗證失敗或 API 請求失敗
 * @example
 * // HTML: <button onclick="generateFiles()">生成檔案</button>
 * // 用戶點擊按鈕時調用
 * generateFiles();
 */
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

    // Validate files
    if (!excelFileData || !wordFileData) {
        let missingFiles = [];
        if (!excelFileData) missingFiles.push('Excel/CSV 資料檔案');
        if (!wordFileData) missingFiles.push('Word 範本檔案');
        alert('❌ 缺少檔案:\n' + missingFiles.join('\n') + '\n\n請先上傳所有必要檔案');
        return;
    }

    // Show progress section
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';

    const formData = new FormData();
    formData.append('excelFile', new Blob([excelFileData]), excelFileName || 'data.xlsx');
    formData.append('wordFile', new Blob([wordFileData]), wordFileName || 'template.docx');
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
            console.error('生成失敗的詳細信息:', error);
            alert('❌ 生成失敗:\n\n' + error.message + '\n\n請檢查:\n✓ 所有字段都已定義\n✓ CSV/Excel 檔案已上傳\n✓ Word 範本已上傳\n✓ 文件格式正確');
            document.getElementById('progressSection').style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('發生錯誤: ' + error.message);
        document.getElementById('progressSection').style.display = 'none';
    }
}

/**
 * 顯示生成結果摘要
 * 
 * 功能:
 * - 隱藏進度部分
 * - 顯示結果部分
 * - 更新結果摘要信息（成功文件數、PDF 數量等）
 * 
 * @function
 * @param {Object} result - API 返回的結果對象
 * @param {number} result.totalFiles - 生成的文件總數
 * @param {number} result.wordCount - 生成的 Word 文件數
 * @param {number} result.pdfCount - 生成的 PDF 文件數
 * @param {number} result.totalRecords - 處理的記錄總數
 * @returns {void}
 * @example
 * const result = {
 *   totalFiles: 10,
 *   wordCount: 10,
 *   pdfCount: 10,
 *   totalRecords: 5
 * };
 * showResults(result);
 */
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

/**
 * 下載所有生成的文件作為 ZIP 壓縮包
 * 
 * 功能:
 * - 發送 GET 請求到 /api/download-zip 端點
 * - 下載 ZIP 文件到本地
 * - 使用 Blob 和 URL API 實現瀏覽器下載
 * - 自動清理 Object URL 以釋放內存
 * 
 * 錯誤處理:
 * - 如果 API 返回失敗，顯示警告
 * - 如果網絡請求失敗，顯示詳細錯誤信息
 * 
 * @async
 * @function
 * @returns {Promise<void>}
 * @throws {alert} 如果下載失敗或網絡錯誤
 * @example
 * // HTML: <button onclick="downloadAll()">下載全部</button>
 * downloadAll();
 * // 瀏覽器將下載 generated_files.zip
 */
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

// ============================================================================
// 頁面初始化 - Page Initialization
// ============================================================================

/**
 * 頁面 DOM 加載完成後的初始化
 * 
 * 功能:
 * - 設置上傳區域的事件監聽器
 * - 處理拖放上傳和點擊上傳
 * - 初始化欄位列表顯示
 * - 設置回車鍵添加欄位快捷鍵
 * - 加載 XLSX 庫（如果還未加載）
 * 
 * 事件:
 * - dragleave: 移除拖放視覺反饋
 * - click: 點擊上傳區域打開文件對話框
 * - keypress: 在輸入框中按回車快速添加欄位
 * 
 * @function
 * @returns {void}
 */
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
