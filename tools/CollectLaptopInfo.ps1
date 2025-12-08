# Laptop Info Collection Script
# Usage: .\CollectLaptopInfo.ps1 -OutputFile "path\to\output.txt" -ID "L20251208163900"

param(
    [string]$OutputFile = "LaptopInfo.txt",
    [string]$ID = "L" + (Get-Date -Format "yyyyMMddHHmmss")
)

Write-Host "Collecting Laptop Info..." -ForegroundColor Cyan

# ===== Basic Hardware Info =====
$bios = Get-WmiObject Win32_BIOS
$system = Get-WmiObject Win32_ComputerSystem

$SN = $bios.SerialNumber
$Model = $system.Model
$Manufacturer = $system.Manufacturer
$ComputerName = $system.Name

# ===== Network Info (no IP) =====
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" -or $_.PhysicalMediaType -ne $null }

# MAC Address (primary adapter)
$primaryAdapter = Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | Select-Object -First 1
$MAC = if ($primaryAdapter) { $primaryAdapter.MacAddress } else { "N/A" }

# Wi-Fi Adapter
$wifiAdapter = Get-NetAdapter | Where-Object { $_.Name -like "*Wi-Fi*" -or $_.Name -like "*Wireless*" -or $_.InterfaceDescription -like "*Wireless*" -or $_.InterfaceDescription -like "*Wi-Fi*" } | Select-Object -First 1
$WiFiAdapter = if ($wifiAdapter) { $wifiAdapter.InterfaceDescription } else { "N/A" }

# Ethernet Adapter
$ethAdapter = Get-NetAdapter | Where-Object { $_.Name -like "*Ethernet*" -or $_.InterfaceDescription -like "*Ethernet*" -or $_.InterfaceDescription -like "*I219*" -or $_.InterfaceDescription -like "*Realtek*" } | Where-Object { $_.InterfaceDescription -notlike "*Wireless*" } | Select-Object -First 1
$EthernetAdapter = if ($ethAdapter) { $ethAdapter.InterfaceDescription } else { "N/A" }

# ===== System Info (no Last Boot) =====
$os = Get-WmiObject Win32_OperatingSystem

$OSVersion = $os.Caption
$OSBuild = (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").DisplayVersion + " (" + $os.BuildNumber + ")"

# Install Date
$installDate = $os.InstallDate
if ($installDate) {
    $InstallDate = [System.Management.ManagementDateTimeConverter]::ToDateTime($installDate).ToString("yyyy-MM-dd")
} else {
    $InstallDate = "N/A"
}

# ===== Hardware Specs =====
$cpu = Get-WmiObject Win32_Processor | Select-Object -First 1
$CPU = $cpu.Name.Trim()

# RAM
$totalRAM = [math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 1GB)
$RAM = "$totalRAM GB"

# Disk
$disk = Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='C:'"
$diskTotal = [math]::Round($disk.Size / 1GB)
$diskFree = [math]::Round($disk.FreeSpace / 1GB)
$DiskSize = "$diskTotal GB"
$DiskFree = "$diskFree GB"

# ===== Battery Info =====
try {
    $battery = Get-WmiObject Win32_Battery
    if ($battery) {
        $BatteryStatus = switch ($battery.BatteryStatus) {
            1 { "Discharging" }
            2 { "AC Power" }
            3 { "Charging" }
            4 { "Low" }
            5 { "Critical" }
            6 { "Charging" }
            7 { "Charging High" }
            8 { "Charging Low" }
            9 { "Charging Critical" }
            10 { "Undefined" }
            11 { "Partially Charged" }
            default { "Unknown" }
        }
        
        # Battery Health (estimated charge remaining)
        $BatteryHealth = "$($battery.EstimatedChargeRemaining)%"
    } else {
        $BatteryStatus = "No Battery"
        $BatteryHealth = "N/A"
    }
} catch {
    $BatteryStatus = "Cannot Read"
    $BatteryHealth = "N/A"
}

# ===== User Info =====
$CurrentUser = $env:USERNAME
$Domain = $env:USERDOMAIN

# ===== Output to File =====
$output = @"
ID=$ID
SN=$SN
Model=$Model
Manufacturer=$Manufacturer
ComputerName=$ComputerName
MAC=$MAC
WiFiAdapter=$WiFiAdapter
EthernetAdapter=$EthernetAdapter
OSVersion=$OSVersion
OSBuild=$OSBuild
InstallDate=$InstallDate
CPU=$CPU
RAM=$RAM
DiskSize=$DiskSize
DiskFree=$DiskFree
BatteryStatus=$BatteryStatus
BatteryHealth=$BatteryHealth
CurrentUser=$CurrentUser
Domain=$Domain
"@

# Output to file
$output | Out-File -FilePath $OutputFile -Encoding UTF8

# Display result
Write-Host ""
Write-Host "===== Collection Result =====" -ForegroundColor Green
Write-Host $output
Write-Host ""
Write-Host "File saved: $OutputFile" -ForegroundColor Yellow
