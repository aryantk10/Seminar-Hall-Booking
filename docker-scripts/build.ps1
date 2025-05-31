# Docker Build Script for Seminar Hall Booking System
# This script builds all Docker images for the application

Write-Host "Building Seminar Hall Booking System Docker Images..." -ForegroundColor Cyan

# Build backend image
Write-Host "Building Backend Image..." -ForegroundColor Yellow
docker build -t seminar-hall-backend:latest ./backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend build failed!" -ForegroundColor Red
    exit 1
}

# Build frontend image
Write-Host "Building Frontend Image..." -ForegroundColor Yellow
docker build -t seminar-hall-frontend:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "All images built successfully!" -ForegroundColor Green

# Show built images
Write-Host "Built Images:" -ForegroundColor Cyan
docker images | Select-String "seminar-hall"

Write-Host "Ready to run with: docker-compose up" -ForegroundColor Green
