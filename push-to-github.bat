@echo off
title Pushing Bus Transport System to GitHub
cd /d "%~dp0"
echo ========================================================
echo Pushing project to GitHub: https://github.com/akshat1655/bus-transport-system.git
echo If a GitHub login window opens in your browser, click "Sign in with your browser".
echo ========================================================
echo.
git branch -M main
git push -u origin main
echo.
echo ========================================================
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Your code is now live on GitHub.
) else (
    echo Something went wrong. Please check your GitHub login.
)
echo ========================================================
echo.
pause
