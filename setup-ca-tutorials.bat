@echo off
echo ========================================
echo   CA FOUNDATION TUTORIALS SETUP
echo ========================================
echo.

cd scripts

echo Checking for .env file...
if not exist .env (
    echo Creating .env file...
    echo MONGODB_URI=mongodb+srv://mgdhanyamohan_db_user:Thathu110@cluster0.5kqyosa.mongodb.net/mgrandhub?retryWrites=true^&w=majority^&appName=Cluster0 > .env
    echo Created .env file
) else (
    echo .env file exists
)

echo.
echo Installing dependencies...
call npm install

echo.
echo ========================================
echo   RUNNING SETUP SCRIPT
echo ========================================
echo.

node setup-ca-tutorials-in-education-module.js

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Your CA tutorials are now in the education module!
echo.
pause
