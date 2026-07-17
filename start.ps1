# SuperApp MGrand Hub - Startup Script

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "SuperApp MGrand Hub - Starting..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
}

# Start services
Write-Host "Starting all services..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "✓ All services started!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Services available at:" -ForegroundColor Cyan
    Write-Host "  - API Gateway:  http://localhost:8080" -ForegroundColor White
    Write-Host "  - Auth Service: http://localhost:3001" -ForegroundColor White
    Write-Host "  - MongoDB:      mongodb://localhost:27017" -ForegroundColor White
    Write-Host "  - Redis:        redis://localhost:6379" -ForegroundColor White
    Write-Host ""
    
    Write-Host "View logs with: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "Stop services with: docker-compose down" -ForegroundColor Yellow
    Write-Host ""
    
    # Wait a moment for services to initialize
    Start-Sleep -Seconds 5
    
    Write-Host "Testing health endpoints..." -ForegroundColor Yellow
    
    try {
        $gateway = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 5
        Write-Host "✓ API Gateway is healthy" -ForegroundColor Green
    } catch {
        Write-Host "⚠ API Gateway not responding yet (may need more time)" -ForegroundColor Yellow
    }
    
    try {
        $auth = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
        Write-Host "✓ Auth Service is healthy" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Auth Service not responding yet (may need more time)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "Ready to use! 🚀" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Test registration: See QUICK_REFERENCE.md" -ForegroundColor White
    Write-Host "2. Read documentation: GETTING_STARTED.md" -ForegroundColor White
    Write-Host "3. Check service status: docker-compose ps" -ForegroundColor White
    
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to start services!" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose logs" -ForegroundColor Yellow
}
