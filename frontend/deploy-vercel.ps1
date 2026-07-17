# Deploy Frontend to Vercel - PowerShell Script

Write-Host "🚀 Deploying SuperApp MGrand Hub Frontend to Vercel" -ForegroundColor Green
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "📦 Checking Vercel CLI..." -ForegroundColor Yellow
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
}

Write-Host ""

# Check if .env.production exists
Write-Host "🔍 Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.production")) {
    Write-Host "⚠️  .env.production not found!" -ForegroundColor Yellow
    Write-Host "📝 Creating .env.production file..." -ForegroundColor Yellow
    
    @"
REACT_APP_API_URL=https://auth-service.onrender.com
REACT_APP_AUTH_SERVICE_URL=https://auth-service.onrender.com
REACT_APP_USER_SERVICE_URL=https://user-service.onrender.com
REACT_APP_ECOMMERCE_SERVICE_URL=https://ecommerce-service.onrender.com
REACT_APP_PAYMENT_SERVICE_URL=https://payment-service.onrender.com
REACT_APP_CLASSIFIEDS_SERVICE_URL=https://classifieds-service.onrender.com
REACT_APP_FOOD_SERVICE_URL=https://food-delivery-service.onrender.com
REACT_APP_NOTIFICATION_SERVICE_URL=https://notification-service.onrender.com
"@ | Out-File -FilePath ".env.production" -Encoding utf8
    
    Write-Host "✅ .env.production created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Update the URLs in .env.production with your actual Render service URLs!" -ForegroundColor Yellow
    Write-Host ""
    
    $continue = Read-Host "Press Enter to continue or Ctrl+C to cancel"
} else {
    Write-Host "✅ .env.production exists" -ForegroundColor Green
}

Write-Host ""

# Test build locally (optional)
$testBuild = Read-Host "Do you want to test build locally first? (y/n)"
if ($testBuild -eq "y") {
    Write-Host "🏗️  Building app locally..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed! Fix errors before deploying." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
}

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
Write-Host ""

vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your app is live!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Visit your Vercel URL to test the app"
    Write-Host "2. Check browser console for any errors"
    Write-Host "3. Test authentication (register/login)"
    Write-Host "4. Configure custom domain (optional)"
    Write-Host ""
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Red
    exit 1
}
