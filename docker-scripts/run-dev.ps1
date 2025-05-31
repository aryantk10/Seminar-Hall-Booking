# Development Environment Runner
# This script starts the development environment with hot reloading

Write-Host "Starting Seminar Hall Booking System (Development Mode)..." -ForegroundColor Cyan

# Stop any existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down

# Start development environment
Write-Host "Starting development containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up --build

Write-Host "Development environment started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:9002" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "MongoDB: mongodb://localhost:27017" -ForegroundColor Cyan
