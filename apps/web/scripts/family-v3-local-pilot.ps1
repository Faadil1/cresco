# Local-only Cresco Family V3 facilitator launcher (Windows PowerShell 5.1+).
# No deploy, no remote Worker access, no Cloudflare credentials or tester invitations.
# Run from the checked-out PR #119 branch (any working directory):
# powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\apps\web\scripts\family-v3-local-pilot.ps1
param(
  [switch]$CheckOnly,
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$expectedBranch = "family/story-led-multipage-2026-10-31"
$testedSourceSha = "9cc2152643ab7f6b9eb137f42da2efc8f04ac594"
$webRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = (Resolve-Path (Join-Path $webRoot "../..")).Path
$pilotURL = "http://127.0.0.1:3100/try"
$previousApiUrl = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_CRESCO_API_URL", "Process")
$previousNodeEnv = [Environment]::GetEnvironmentVariable("NODE_ENV", "Process")
$previousMetrics = [Environment]::GetEnvironmentVariable("WRANGLER_SEND_METRICS", "Process")
$oldLocation = (Get-Location).Path

function GitValue([string[]]$GitArgs) {
  $value = & git -C $repoRoot @GitArgs 2>&1
  if ($LASTEXITCODE -ne 0) { throw "Git preflight failed: $($GitArgs -join ' ')" }
  return (($value | Out-String).Trim())
}

try {
  if ($env:OS -ne "Windows_NT") { throw "WINDOWS_ONLY: use Windows PowerShell on the facilitator's own computer." }
  foreach ($tool in @("git", "node", "npm.cmd")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "MISSING_TOOL: $tool. Install Git and Node.js 22+." }
  }
  $version = (& node -v).Trim()
  if ($LASTEXITCODE -ne 0 -or $version -notmatch '^v([0-9]+)\.') { throw "Cannot determine Node.js version." }
  if ([int]$Matches[1] -lt 22) { throw "Node.js 22+ required (found $version)." }

  $branch = GitValue @("branch", "--show-current")
  if ($branch -and $branch -ne $expectedBranch) {
    throw "WRONG_BRANCH: '$branch'. Use the isolated PR #119 branch, never Colosseum/main or a historic Family branch."
  }
  $actualSha = GitValue @("rev-parse", "HEAD")
  $dirty = GitValue @("status", "--porcelain", "--untracked-files=all")
  if ($dirty) { throw "DIRTY_CHECKOUT: use a clean worktree. No install or build started." }
  & git -C $repoRoot merge-base --is-ancestor $testedSourceSha HEAD 2>$null
  if ($LASTEXITCODE -ne 0) { throw "UNVERIFIED_SOURCE: required tested commit is not an ancestor. No pilot allowed." }

  # Post-test documentation and THIS launcher are safe; app-source changes are
  # not. Revisit this allowlist and validated SHA after any V3 product edit.
  $changed = @(& git -C $repoRoot diff --name-only "$testedSourceSha..HEAD" --)
  if ($LASTEXITCODE -ne 0) { throw "Unable to verify product tree against the tested commit." }
  foreach ($file in $changed) {
    if (-not $file) { continue }
    $allowedDoc = $file.StartsWith("docs/family/story-led-2026-10-31/")
    $allowedLauncher = $file -eq "apps/web/scripts/family-v3-local-pilot.ps1"
    if (-not ($allowedDoc -or $allowedLauncher)) {
      throw "UNTESTED_CHANGE: $file differs from tested product. No local pilot started."
    }
  }
  if (-not (Test-Path (Join-Path $webRoot "package.json"))) { throw "Missing apps/web/package.json." }
  Write-Host "CRESCO_FAMILY_V3_LOCAL_PREFLIGHT=PASS" -ForegroundColor Green
  Write-Host "HEAD=$actualSha  TESTED_SOURCE=$testedSourceSha"
  Write-Host "Mode: no account, local browser only, simulated Parent, fictional credits; NO DEPLOY"
  if ($CheckOnly) { Write-Host "CHECK_ONLY=PASS. No server, install or build started."; return }

  # Fail closed rather than accidentally showing a prior server on port 3100.
  $portCheck = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), 3100)
  try { $portCheck.Start() } catch { throw "LOCAL_PORT_BUSY: port 3100 is already in use. Stop the prior server before continuing." } finally { $portCheck.Stop() }
  Set-Location $webRoot
  $env:NEXT_PUBLIC_CRESCO_API_URL = ""
  [Environment]::SetEnvironmentVariable("NODE_ENV", $null, "Process")
  $env:WRANGLER_SEND_METRICS = "false"
  if (-not $SkipInstall) {
    Write-Host "Installing dependencies locally (npm ci)..." -ForegroundColor Cyan
    & npm.cmd ci --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw "NPM_INSTALL_FAILED" }
  }
  Write-Host "Building isolated V3 Family artifact locally..." -ForegroundColor Cyan
  & npm.cmd run build:public-family
  if ($LASTEXITCODE -ne 0) { throw "ISOLATED_BUILD_FAILED" }

  Write-Host ""
  Write-Host "LOCAL_V3_READY: open $pilotURL in a browser on THIS computer." -ForegroundColor Green
  Write-Host "Keep this window open during the session. Press Ctrl+C to stop."
  Write-Host "Before EACH new family, reload once and verify goal, Parent and Result are empty."
  Write-Host "This is NOT a remotely shareable URL, and no real Parent identity or payment exists."
  & npm.cmd run start:vinext -- --ip 127.0.0.1 --port 3100
  if ($LASTEXITCODE -ne 0) { throw "LOCAL_SERVER_EXITED_WITH_ERROR" }
} catch {
  Write-Host "CRESCO_FAMILY_V3_LOCAL=NO_GO" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
} finally {
  [Environment]::SetEnvironmentVariable("NEXT_PUBLIC_CRESCO_API_URL", $previousApiUrl, "Process")
  [Environment]::SetEnvironmentVariable("NODE_ENV", $previousNodeEnv, "Process")
  [Environment]::SetEnvironmentVariable("WRANGLER_SEND_METRICS", $previousMetrics, "Process")
  Set-Location $oldLocation
}
