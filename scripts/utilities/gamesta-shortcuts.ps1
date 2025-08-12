# Gamesta Quick Launch Scripts
# Save time with these PowerShell shortcuts!

# Quick start development
function Start-Gamesta {
    Write-Host "🎮 Starting Gamesta development server..." -ForegroundColor Magenta
    npm run dev
}

# Quick build
function Build-Gamesta {
    Write-Host "🔨 Building Gamesta for production..." -ForegroundColor Cyan
    npm run build
}

# Quick deploy
function Deploy-Gamesta {
    Write-Host "🚀 Deploying Gamesta to GitHub Pages..." -ForegroundColor Green
    npm run deploy
}

# Quick preview
function Preview-Gamesta {
    Write-Host "👀 Previewing Gamesta production build..." -ForegroundColor Yellow
    npm run preview
}

# Clean install when things break
function Reset-Gamesta {
    Write-Host "🧹 Cleaning and reinstalling Gamesta..." -ForegroundColor Red
    Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
    npm install
}

# Full pipeline
function Deploy-GamestaFull {
    Write-Host "🎯 Running full Gamesta deployment pipeline..." -ForegroundColor Blue
    Reset-Gamesta
    npm run build
    npm run deploy
}

# Show available commands
function Show-GamestaCommands {
    Write-Host "🎮 Gamesta PowerShell Commands:" -ForegroundColor Magenta
    Write-Host "  Start-Gamesta      🎮 Start development server" -ForegroundColor White
    Write-Host "  Build-Gamesta      🔨 Build for production" -ForegroundColor White  
    Write-Host "  Preview-Gamesta    👀 Preview production build" -ForegroundColor White
    Write-Host "  Deploy-Gamesta     🚀 Deploy to GitHub Pages" -ForegroundColor White
    Write-Host "  Reset-Gamesta      🧹 Clean install dependencies" -ForegroundColor White
    Write-Host "  Deploy-GamestaFull 🎯 Full build and deploy pipeline" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Pro tip: Add this file to your PowerShell profile for global access!" -ForegroundColor Green
}

# Aliases for even quicker access
Set-Alias -Name "gdev" -Value Start-Gamesta
Set-Alias -Name "gbuild" -Value Build-Gamesta  
Set-Alias -Name "gdeploy" -Value Deploy-Gamesta
Set-Alias -Name "gpreview" -Value Preview-Gamesta
Set-Alias -Name "greset" -Value Reset-Gamesta
Set-Alias -Name "gfull" -Value Deploy-GamestaFull
Set-Alias -Name "ghelp" -Value Show-GamestaCommands

# Welcome message
Write-Host "🎮 Gamesta PowerShell shortcuts loaded!" -ForegroundColor Magenta
Write-Host "Type 'ghelp' to see all available commands" -ForegroundColor White
Write-Host "Quick start: Type 'gdev' to start development!" -ForegroundColor Green
