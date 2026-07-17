# Quick Deploy Script - CORS Fix
# Run this to commit and push CORS changes

Write-Host "🚀 Deploying CORS Fix..." -ForegroundColor Cyan
Write-Host ""

# Check git status
Write-Host "📝 Checking changes..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "📦 Adding files..." -ForegroundColor Yellow
git add services/auth-service/src/app.js
git add services/user-service/src/app.js
git add services/payment-service/src/app.js
git add services/notification-service/src/app.js
git add gateway/nginx/conf.d/default.conf
git add frontend/public/_headers
git add CORS_OPEN_NOW.md
git add deploy-cors-fix.ps1

Write-Host ""
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "fix: enable full CORS wildcard for all domains

- Set origin: '*' in all backend services
- Add CORS headers in nginx gateway
- Frontend _headers already configured
- Fixes: CORS policy blocking requests from frontend"

Write-Host ""
Write-Host "🌐 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ DONE! Changes pushed to GitHub" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to Render Dashboard: https://dashboard.render.com/" -ForegroundColor White
Write-Host "2. Find 'auth-service' (or your backend service)" -ForegroundColor White
Write-Host "3. Click 'Manual Deploy' → 'Deploy latest commit'" -ForegroundColor White
Write-Host "4. Wait 2-3 minutes for deployment" -ForegroundColor White
Write-Host "5. Test your frontend - CORS should work!" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Test CORS:" -ForegroundColor Cyan
Write-Host "curl -i https://auth-service.onrender.com/health" -ForegroundColor Gray
Write-Host ""
