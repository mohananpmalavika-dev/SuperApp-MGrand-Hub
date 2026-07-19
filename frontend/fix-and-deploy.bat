@echo off
echo.
echo ========================================
echo    FIX API 404 ERROR - REBUILD & DEPLOY
echo ========================================
echo.
echo This will:
echo 1. Rebuild your frontend with the fix
echo 2. Deploy to Vercel
echo.
pause

echo.
echo [1/3] Installing dependencies...
call npm install

echo.
echo [2/3] Building production bundle...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo [3/3] Deploying to Vercel...
echo.
echo NOTE: Make sure you have Vercel CLI installed
echo If not, run: npm install -g vercel
echo.
pause

call vercel --prod

echo.
echo ========================================
echo    DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Test your registration: https://your-domain.vercel.app
echo 2. Check browser console for API URLs
echo 3. Verify no more 404 errors
echo.
echo Read FIX_404_API_ERROR.md for more details
echo.
pause
