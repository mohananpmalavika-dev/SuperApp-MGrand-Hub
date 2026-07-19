@echo off
echo ============================================
echo   Starting Content Generation Service
echo ============================================

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  WARNING: Please update the .env file with your API keys!
    echo.
    pause
)

echo Starting service in development mode...
npm run dev
