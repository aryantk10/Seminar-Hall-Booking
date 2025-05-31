# Create admin user

$adminBody = @{
    name = "Admin User"
    email = "admin@test.com"
    password = "admin123"
    role = "admin"
    department = "Administration"
} | ConvertTo-Json

Write-Host "Creating admin user..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $adminBody -ContentType "application/json"
    Write-Host "Admin user created successfully!"
    Write-Host "Email: admin@test.com"
    Write-Host "Password: admin123"
    Write-Host "Role: admin"
} catch {
    Write-Host "Admin creation failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}
