# Test script to create a user and test login

$registerBody = @{
    name = "Test Faculty"
    email = "faculty@test.com"
    password = "password123"
    role = "faculty"
    department = "Computer Science"
} | ConvertTo-Json

$loginBody = @{
    email = "faculty@test.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "Creating test user..."
try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "User created successfully!"
    Write-Host "User ID: $($registerResponse._id)"
    Write-Host "Email: $($registerResponse.email)"
    Write-Host "Role: $($registerResponse.role)"
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}

Write-Host "`nTesting login..."
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful!"
    Write-Host "Token: $($loginResponse.token)"
} catch {
    Write-Host "Login failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}
