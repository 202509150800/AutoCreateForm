# Merge Laptop Info TXT files to CSV/Excel
# Usage: .\MergeToExcel.ps1 -InputFolder ".\output" -OutputFile ".\LaptopInventory.csv"

param(
    [string]$InputFolder = ".\output",
    [string]$OutputFile = ".\LaptopInventory.csv"
)

Write-Host "========================================"
Write-Host "  Laptop Info Merge Tool" -ForegroundColor Cyan
Write-Host "========================================"
Write-Host ""

# Check input folder exists
if (-not (Test-Path $InputFolder)) {
    Write-Host "[ERROR] Input folder not found: $InputFolder" -ForegroundColor Red
    exit 1
}

# Get all L*.txt files
$files = Get-ChildItem -Path $InputFolder -Filter "L*.txt" | Sort-Object Name

if ($files.Count -eq 0) {
    Write-Host "[ERROR] No L*.txt files found in $InputFolder" -ForegroundColor Red
    Write-Host "Please run CollectLaptopInfo.bat first to generate data files."
    exit 1
}

Write-Host "[INFO] Found $($files.Count) file(s) to process" -ForegroundColor Green
Write-Host ""

# Read all files into array
$allData = @()

foreach ($file in $files) {
    Write-Host "  Processing: $($file.Name)" -ForegroundColor Yellow
    
    $data = @{}
    $content = Get-Content $file.FullName -Encoding UTF8
    
    foreach ($line in $content) {
        if ($line -match "^(.+?)=(.*)$") {
            $key = $Matches[1].Trim()
            $value = $Matches[2].Trim()
            $data[$key] = $value
        }
    }
    
    if ($data.Count -gt 0) {
        $allData += $data
    }
}

if ($allData.Count -eq 0) {
    Write-Host "[ERROR] No valid data found in files" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[INFO] Total records: $($allData.Count)" -ForegroundColor Green

# Force CSV output (change xlsx to csv)
$OutputFile = $OutputFile -replace "\.xlsx$", ".csv"

# Build CSV content
$csvLines = @()

# Header row
$headers = @("ID", "SN", "Model", "Manufacturer", "ComputerName", "MAC", "WiFiAdapter", "EthernetAdapter", "OSVersion", "OSBuild", "InstallDate", "CPU", "RAM", "DiskSize", "DiskFree", "BatteryStatus", "BatteryHealth", "CurrentUser", "Domain")
$csvLines += $headers -join ","

# Data rows
foreach ($record in $allData) {
    $values = @()
    foreach ($header in $headers) {
        $val = if ($record[$header]) { $record[$header] } else { "" }
        # Escape commas and quotes for CSV
        if ($val -match '[,"]') {
            $val = "`"$($val -replace '"', '""')`""
        }
        $values += $val
    }
    $csvLines += $values -join ","
}

# Write CSV file
$csvLines | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Host ""
Write-Host "========================================"
Write-Host "  Complete!" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""
Write-Host "CSV file created: $OutputFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Open the CSV file in Excel"
Write-Host "  2. Save as .xlsx if needed"
Write-Host "  3. Use with AutoCreateForm to generate forms"
Write-Host ""
