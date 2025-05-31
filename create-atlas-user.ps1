# Create a new user in Atlas database

$newUserBody = @{
    name = "Atlas Faculty"
    email = "atlas@faculty.com"
    password = "atlas123"
    role = "faculty"
    department = "Computer Science"
} | ConvertTo-Json

$adminUserBody = @{
    name = "Atlas Admin"
    email = "atlas@admin.com"
    password = "atlas123"
    role = "admin"
    department = "Administration"
} | ConvertTo-Json

Write-Host "Creating Atlas faculty user..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $newUserBody -ContentType "application/json"
    Write-Host "Faculty user created successfully!"
    Write-Host "Email: atlas@faculty.com"
    Write-Host "Password: atlas123"
    Write-Host "Role: faculty"
} catch {
    Write-Host "Faculty user creation failed: $($_.Exception.Message)"
}

Write-Host "`nCreating Atlas admin user..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $adminUserBody -ContentType "application/json"
    Write-Host "Admin user created successfully!"
    Write-Host "Email: atlas@admin.com"
    Write-Host "Password: atlas123"
    Write-Host "Role: admin"
} catch {
    Write-Host "Admin user creation failed: $($_.Exception.Message)"
}
