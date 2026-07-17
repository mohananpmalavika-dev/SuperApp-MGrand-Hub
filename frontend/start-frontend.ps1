#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MGrand Hub - Frontend Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    Write-Host ""
}

# Check if backend is running
Write-Host "🔍 Checking if backend is running..." -ForegroundColor Yellow
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    $backendRunning = $true
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend not detected. Make sure to start backend services!" -ForegroundColor Yellow
    Write-Host "   Run: cd .. && docker-compose up -d" -ForegroundColor Gray
}
Write-Host ""

# Start frontend
Write-Host "🚀 Starting React development server..." -ForegroundColor Cyan
Write-Host "   Frontend will be available at: http://localhost:3000" -ForegroundColor Gray
Write-Host "   API Gateway: http://localhost:8080" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm start
