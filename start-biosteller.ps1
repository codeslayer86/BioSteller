# BioSteller Startup Script for Windows PowerShell
# This script automates the entire setup and startup process

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BioSteller Setup & Launch Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Function to check if port is in use
function Test-Port {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Function to kill process on port
function Stop-PortProcess {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connection) {
        $processId = $connection.OwningProcess
        Write-Host "Stopping process on port $Port (PID: $processId)..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# Check if Node.js is installed
Write-Host "[Step 1/8] Checking prerequisites..." -ForegroundColor Green
if (-not (Test-Command "node")) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

$nodeVersion = node --version
Write-Host "  Node.js version: $nodeVersion" -ForegroundColor White
Write-Host ""

# Check if npm is installed
if (-not (Test-Command "npm")) {
    Write-Host "ERROR: npm is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js which includes npm." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "  npm version: $(npm --version)" -ForegroundColor White
Write-Host ""

# Check and install frontend dependencies
Write-Host "[Step 2/8] Checking frontend dependencies..." -ForegroundColor Green
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing frontend dependencies... (this may take a minute)" -ForegroundColor Yellow
    npm install --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install frontend dependencies!" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "  Frontend dependencies installed successfully!" -ForegroundColor White
} else {
    Write-Host "  Frontend dependencies already installed." -ForegroundColor White
}
Write-Host ""

# Check and install backend dependencies
Write-Host "[Step 3/8] Checking backend dependencies..." -ForegroundColor Green
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "  Installing backend dependencies... (this may take a minute)" -ForegroundColor Yellow
    Push-Location backend
    npm install --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install backend dependencies!" -ForegroundColor Red
        Pop-Location
        pause
        exit 1
    }
    Pop-Location
    Write-Host "  Backend dependencies installed successfully!" -ForegroundColor White
} else {
    Write-Host "  Backend dependencies already installed." -ForegroundColor White
}
Write-Host ""

# Setup backend environment file
Write-Host "[Step 4/8] Checking backend configuration..." -ForegroundColor Green
if (-not (Test-Path "backend\.env")) {
    Write-Host "  Creating backend\.env from template..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "  Configuration file created!" -ForegroundColor White
} else {
    Write-Host "  Configuration file exists." -ForegroundColor White
}
Write-Host ""

# Check if API key is set
Write-Host "[Step 5/8] Checking API key configuration..." -ForegroundColor Green
$envContent = Get-Content "backend\.env" -Raw
$currentApiKey = if ($envContent -match 'API_KEY=(.+)') { $matches[1].Trim() } else { "" }

$needsApiKey = $false
if ([string]::IsNullOrWhiteSpace($currentApiKey) -or 
    $currentApiKey -eq "your_gemini_api_key_here" -or 
    $currentApiKey -eq "?" -or 
    $currentApiKey.Length -lt 20) {
    $needsApiKey = $true
}

if ($needsApiKey) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  API Key Required" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You need a FREE Google Gemini API key to use BioSteller." -ForegroundColor White
    Write-Host ""
    Write-Host "How to get your API key:" -ForegroundColor Cyan
    Write-Host "  1. Visit: https://aistudio.google.com/app/apikey" -ForegroundColor White
    Write-Host "  2. Sign in with your Google account" -ForegroundColor White
    Write-Host "  3. Click 'Create API Key'" -ForegroundColor White
    Write-Host "  4. Copy the key (starts with AIzaSy...)" -ForegroundColor White
    Write-Host ""
    
    $openBrowser = Read-Host "Would you like to open the API key page in your browser? (Y/N)"
    if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
        Start-Process "https://aistudio.google.com/app/apikey"
        Write-Host "  Browser opened. Please get your API key and return here." -ForegroundColor Green
        Write-Host ""
    }
    
    $apiKey = Read-Host "Please enter your Gemini API key"
    
    if ([string]::IsNullOrWhiteSpace($apiKey) -or $apiKey.Length -lt 20) {
        Write-Host ""
        Write-Host "ERROR: Invalid API key provided!" -ForegroundColor Red
        Write-Host "The API key should be at least 20 characters long." -ForegroundColor Yellow
        Write-Host ""
        pause
        exit 1
    }
    
    # Update the .env file with the API key
    $envContent = $envContent -replace 'API_KEY=.*', "API_KEY=$apiKey"
    Set-Content "backend\.env" -Value $envContent -NoNewline
    
    Write-Host "  API key configured successfully!" -ForegroundColor Green
} else {
    Write-Host "  API key is already configured." -ForegroundColor White
}
Write-Host ""

# Run database migrations
Write-Host "[Step 6/8] Setting up database..." -ForegroundColor Green
Push-Location backend
$migrationOutput = npm run knex:migrate:latest 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  WARNING: Database migration had issues, but continuing..." -ForegroundColor Yellow
} else {
    Write-Host "  Database initialized successfully!" -ForegroundColor White
}
Pop-Location
Write-Host ""

# Check if ports are available
Write-Host "[Step 7/8] Checking ports..." -ForegroundColor Green
if (Test-Port 3001) {
    Write-Host "  Port 3001 is in use. Attempting to free it..." -ForegroundColor Yellow
    Stop-PortProcess 3001
}
if (Test-Port 3000) {
    Write-Host "  Port 3000 is in use. Attempting to free it..." -ForegroundColor Yellow
    Stop-PortProcess 3000
}
Write-Host "  Ports are ready!" -ForegroundColor White
Write-Host ""

# Start the servers
Write-Host "[Step 8/8] Starting BioSteller servers..." -ForegroundColor Green
Write-Host ""

# Start backend server
Write-Host "  Starting backend server on http://localhost:3001 ..." -ForegroundColor Cyan
Push-Location backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev 2>&1
}
Pop-Location
Start-Sleep -Seconds 3

# Check if backend started successfully
$backendOutput = Receive-Job $backendJob
if ($backendOutput -match "Server is listening" -or $backendOutput -match "nodemon") {
    Write-Host "  Backend server started successfully!" -ForegroundColor Green
} else {
    Write-Host "  Backend server may have issues. Check the output below:" -ForegroundColor Yellow
    Write-Host $backendOutput -ForegroundColor Gray
}
Write-Host ""

# Start frontend server
Write-Host "  Starting frontend server on http://localhost:3000 ..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev 2>&1
}
Start-Sleep -Seconds 3

# Check if frontend started successfully
$frontendOutput = Receive-Job $frontendJob
if ($frontendOutput -match "ready in" -or $frontendOutput -match "VITE") {
    Write-Host "  Frontend server started successfully!" -ForegroundColor Green
} else {
    Write-Host "  Frontend server may have issues. Check the output below:" -ForegroundColor Yellow
    Write-Host $frontendOutput -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  BioSteller is now running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening BioSteller in your default browser..." -ForegroundColor White
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"
Write-Host ""
Write-Host "Press any key to stop all servers and exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Write-Host ""
Write-Host "Stopping servers..." -ForegroundColor Yellow
Stop-Job $backendJob -ErrorAction SilentlyContinue
Stop-Job $frontendJob -ErrorAction SilentlyContinue
Remove-Job $backendJob -ErrorAction SilentlyContinue
Remove-Job $frontendJob -ErrorAction SilentlyContinue

# Kill any remaining processes
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*biosteller*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Servers stopped. Goodbye!" -ForegroundColor Green
Write-Host ""
