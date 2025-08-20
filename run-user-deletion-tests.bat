@echo off
REM Comprehensive User Deletion Test Runner
REM This script runs the user deletion tests with proper error handling

echo ========================================
echo User Deletion Test Runner
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js and try again
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found
    echo Make sure your environment variables are properly configured
    echo.
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

REM Run the tests
echo Starting user deletion tests...
echo.
node test-user-deletion.js

REM Capture exit code
set TEST_EXIT_CODE=%errorlevel%

echo.
echo ========================================
if %TEST_EXIT_CODE% equ 0 (
    echo ALL TESTS PASSED!
    echo ========================================
) else (
    echo SOME TESTS FAILED!
    echo Check the output above for details
    echo ========================================
)

REM Pause to see results
echo.
echo Press any key to exit...
pause >nul

exit /b %TEST_EXIT_CODE%