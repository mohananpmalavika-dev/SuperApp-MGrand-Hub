# SuperApp MGrand Hub - Status Check

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "SuperApp MGrand Hub - Status" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Docker Containers:" -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "Testing Health Endpoints..." -ForegroundColor Yellow
Write-Host ""

try {
    $gateway = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "✓ API Gateway (8080):  HEALTHY" -ForegroundColor Green
} catch {
    Write-Host "✗ API Gateway (8080):  DOWN" -ForegroundColor Red
}

try {
    $auth = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "✓ Auth Service (3001): HEALTHY" -ForegroundColor Green
} catch {
    Write-Host "✗ Auth Service (3001): DOWN" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
