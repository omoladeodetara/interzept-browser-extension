# PowerShell Release Script for Interzept Chrome Extension

# Exit on any error
$ErrorActionPreference = "Stop"

# Get the current version from package.json
$packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$version = $packageJson.version

Write-Host "Creating release for version $version..." -ForegroundColor Green

# Create a new git tag with the version
git tag -a "v$version" -m "Release version $version"

# Push the new tag to the remote repository
git push origin "v$version"

# Create GitHub release if gh CLI is available
try {
    gh --version | Out-Null
    gh release create "v$version" --title "Release v$version" --notes "Release version $version with updated Lucide React icons"
    Write-Host "GitHub release created successfully!" -ForegroundColor Green
    Write-Host "Note: Download the source code from GitHub and use the repository folder directly for Chrome extension import." -ForegroundColor Cyan
} catch {
    Write-Host "GitHub CLI not available. Please manually create the release on GitHub." -ForegroundColor Yellow
    Write-Host "Use the repository folder directly for Chrome extension import: $PWD" -ForegroundColor Cyan
}

Write-Host "Release process completed!" -ForegroundColor Green
