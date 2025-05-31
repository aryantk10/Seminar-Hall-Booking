# Production Environment Runner
# This script starts the production environment

Write-Host "🚀 Starting Seminar Hall Booking System (Production Mode)..." -ForegroundColor Cyan

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Start production environment
Write-Host "🔄 Starting production containers..." -ForegroundColor Yellow
docker-compose up --build -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service status
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host "✅ Production environment started!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:9003" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🗄️ MongoDB: mongodb://localhost:27017" -ForegroundColor Cyan
Write-Host "📈 Monitoring:" -ForegroundColor Cyan
Write-Host "  - Jenkins: http://localhost:8080" -ForegroundColor Gray
Write-Host "  - Prometheus: http://localhost:9090" -ForegroundColor Gray
Write-Host "  - Grafana: http://localhost:3000" -ForegroundColor Gray
Write-Host "  - Kibana: http://localhost:5601" -ForegroundColor Gray
