# Family-only candidate validation on Windows. This NEVER runs a deploy command.
# Usage (from apps/web on the Family PR #114 checkout):
#   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\family-pr114-local-proof.ps1
param(
  [switch]$SkipInstall
)
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$expectedBranch = "family/dual-learning-paths-full-practice-2026-10-30"
$web = Split-Path -Parent $PSScriptRoot
$root = (Resolve-Path (Join-Path $web "../..")).Path
$originalApi = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_CRESCO_API_URL", "Process")
$originalNodeEnv = [Environment]::GetEnvironmentVariable("NODE_ENV", "Process")
$startLocation = (Get-Location).Path

function GitText([string[]]$Arguments) {
  $value = & git -C $root @Arguments 2>&1
  if ($LASTEXITCODE -ne 0) { throw "Git failed: $($Arguments -join ' ')" }
  return (($value | Out-String).Trim())
}
function RunChecked([string]$Label, [string]$Command, [string[]]$Arguments, [string]$Log) {
  Write-Host "CHECK $Label" -ForegroundColor Cyan
  $before = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    & $Command @Arguments 2>&1 | Tee-Object -FilePath $Log
    $exitCode = $LASTEXITCODE
  } finally { $ErrorActionPreference = $before }
  if ($exitCode -ne 0) { throw "FAIL $Label ($exitCode), log: $Log" }
  Write-Host "PASS $Label" -ForegroundColor Green
}

try {
  if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) { throw "Node/npm not found. Node.js 22+ required." }
  if (-not (Get-Command npx.cmd -ErrorAction SilentlyContinue)) { throw "npx not found." }
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "git not found." }
  $branch = GitText -Arguments @("rev-parse", "--abbrev-ref", "HEAD")
  if ($branch -ne $expectedBranch) {
    throw "WRONG_BRANCH: got '$branch', expected '$expectedBranch'. Do not run this on original Colosseum or public Family checkout."
  }
  $sha = GitText -Arguments @("rev-parse", "HEAD")
  $dirty = GitText -Arguments @("status", "--porcelain")
  if ($dirty) { throw "DIRTY_CHECKOUT: commit/stash your changes or use a clean checkout. No verification was run." }
  $nodeVersion = & node -v
  if ($LASTEXITCODE -ne 0) { throw "Node.js is not available." }
  if ([int]($nodeVersion.Substring(1).Split(".")[0]) -lt 22) { throw "Node.js >=22 is required, found $nodeVersion" }

  $output = Join-Path $env:TEMP ("cresco-family-pr114-proof-" + $sha.Substring(0, 12))
  New-Item -ItemType Directory -Path $output -Force | Out-Null
  Set-Location $web
  $env:NEXT_PUBLIC_CRESCO_API_URL = ""
  [Environment]::SetEnvironmentVariable("NODE_ENV", $null, "Process")

  if (-not $SkipInstall) {
    RunChecked "npm-dependencies" "npm.cmd" @("ci","--no-audit","--no-fund") (Join-Path $output "01-install.log")
    RunChecked "playwright-dependency" "npm.cmd" @("install","--no-save","--no-audit","--no-fund","@playwright/test") (Join-Path $output "02-playwright-dep.log")
  }
  RunChecked "typecheck" "npm.cmd" @("run","typecheck") (Join-Path $output "03-typecheck.log")
  RunChecked "lint" "npm.cmd" @("run","lint") (Join-Path $output "04-lint.log")
  RunChecked "copy-lint" "npm.cmd" @("run","copy:lint") (Join-Path $output "05-copy-lint.log")
  RunChecked "unit-tests" "npm.cmd" @("test") (Join-Path $output "06-unit-tests.log")
  RunChecked "family-public-build" "npm.cmd" @("run","build:public-family") (Join-Path $output "07-build.log")
  RunChecked "public-artifact-isolation" "node" @("scripts/family-public-web-release.mjs","--validate-artifact") (Join-Path $output "08-isolation.log")
  RunChecked "webkit-dependency" "npx.cmd" @("playwright","install","webkit") (Join-Path $output "09-webkit.log")
  RunChecked "family-browser-webkit" "npx.cmd" @("playwright","test","--config","playwright.family-public.config.mjs","--reporter=list") (Join-Path $output "10-webkit.log")

  $report = @(
    "# Family PR #114 local candidate verification",
    "",
    "Repository: Faadil1/cresco",
    "Branch: $branch",
    "HEAD: $sha",
    "Node: $nodeVersion",
    "Mode: NO DEPLOY, browser-only fictional Family Worker",
    "WebKit checks: PASS",
    "Dependencies, typecheck, lint, copy-lint, unit tests, public build, isolation: PASS",
    "Evidence directory: $output",
    "",
    "Note: CLI PASS is not a human visual review, secure real guardian identity or proof of actual financial execution.",
    "Original Colosseum and Cloudflare target deployments: NOT MODIFIED"
  )
  $report | Out-File -FilePath (Join-Path $output "PROOF.md") -Encoding UTF8
  Write-Host "FAMILY_PR114_LOCAL_PROOF=PASS" -ForegroundColor Green
  Write-Host "SHA=$sha"
  Write-Host "PROOF=$output\PROOF.md"
} catch {
  Write-Host "FAMILY_PR114_LOCAL_PROOF=NO_GO" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
} finally {
  [Environment]::SetEnvironmentVariable("NEXT_PUBLIC_CRESCO_API_URL", $originalApi, "Process")
  [Environment]::SetEnvironmentVariable("NODE_ENV", $originalNodeEnv, "Process")
  Set-Location $startLocation
}
