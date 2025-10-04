@echo off
REM BioSteller Quick Launch Wrapper
REM This batch file launches the PowerShell script

echo Starting BioSteller...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0start-biosteller.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to start BioSteller
    echo.
    echo If you see an execution policy error, please run this in PowerShell:
    echo Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
    echo.
    pause
)
