@echo off
echo.
echo ========================================
echo    ICAI CA FOUNDATION INTEGRATION
echo ========================================
echo.
echo Starting integration of ICAI CA Foundation materials...
echo.

cd /d "%~dp0scripts"

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Running integration script...
echo.

node integrate-icai-foundation-materials.js

echo.
echo ========================================
echo Press any key to exit...
pause >nul
