$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$localUrl = 'http://127.0.0.1:4173/'

function Test-AccircRunning {
  try {
    $response = Invoke-WebRequest -Uri $localUrl -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  } catch {
    return $false
  }
}

function Assert-CommandAvailable {
  param(
    [Parameter(Mandatory = $true)]
    [string]$CommandName,
    [Parameter(Mandatory = $true)]
    [string]$InstallHint
  )

  if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
    Write-Host "$CommandName is required but was not found." -ForegroundColor Red
    Write-Host $InstallHint -ForegroundColor Yellow
    exit 1
  }
}

Assert-CommandAvailable -CommandName 'node' -InstallHint 'Install Node.js from https://nodejs.org/ and then run this launcher again.'
Assert-CommandAvailable -CommandName 'npm' -InstallHint 'npm is normally installed with Node.js. Reinstall Node.js if npm is missing.'

Set-Location $repoRoot

if (-not (Test-Path (Join-Path $repoRoot 'node_modules'))) {
  Write-Host 'Installing project dependencies for the first run...' -ForegroundColor Cyan
  npm install
  if ($LASTEXITCODE -ne 0) {
    throw 'npm install failed.'
  }
}

if (Test-AccircRunning) {
  Write-Host "AC Circuits Calculator is already running at $localUrl" -ForegroundColor Green
  Start-Process $localUrl
  exit 0
}

Write-Host 'Starting the local AC Circuits Calculator server...' -ForegroundColor Cyan
$serverProcess = Start-Process -FilePath 'cmd.exe' -ArgumentList '/k', 'npm run dev:local' -WorkingDirectory $repoRoot -PassThru

for ($attempt = 0; $attempt -lt 30; $attempt++) {
  Start-Sleep -Seconds 1

  if ($serverProcess.HasExited) {
    throw 'The local server exited before it finished starting.'
  }

  if (Test-AccircRunning) {
    Start-Process $localUrl
    Write-Host "AC Circuits Calculator is running at $localUrl" -ForegroundColor Green
    exit 0
  }
}

throw 'Timed out waiting for the local server to start.'
