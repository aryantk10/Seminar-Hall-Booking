# Kill processes using ports 5000 and 9002
$ports = @(5000, 9002)
foreach ($port in $ports) {
    $processId = netstat -ano | findstr ":$port" | findstr "LISTENING"
    if ($processId) {
        $pid = $processId.Split()[-1]
        taskkill /PID $pid /F
        Write-Host "Killed process using port $port"
    }
}

# Start the server
npm run dev 