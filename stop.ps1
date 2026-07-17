# SuperApp MGrand Hub - Stop Script

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Stopping SuperApp MGrand Hub..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ All services stopped" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to stop services" -ForegroundColor Red
}
