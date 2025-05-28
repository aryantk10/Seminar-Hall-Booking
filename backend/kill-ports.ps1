# Kill processes using ports 5000 and 9002
$ports = @(5000, 9002)

foreach ($port in $ports) {
    $processIds = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    
    foreach ($processId in $processIds) {
        try {
            $process = Get-Process -Id $processId -ErrorAction Stop
            Write-Host "Killing process $($process.ProcessName) (PID: $processId) using port $port"
            Stop-Process -Id $processId -Force
        } catch {
            Write-Host "No process found using port $port"
        }
    }
} 