<#
.SYNOPSIS
  CRESCO Family: Cloudflare account inventory (READ-ONLY, Windows).
.DESCRIPTION
  Runs repository fake-response tests first, then exactly three Cloudflare GETs
  using scripts/family-cloudflare-readonly-inventory.mjs. No deploy or mutations.
  Never enter a Cloudflare token into chat or commit it to GitHub.
#>
[CmdletBinding()]
param(
    [switch]$TestsOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$nodeScript = Join-Path $PSScriptRoot 'family-cloudflare-readonly-inventory.mjs'
$nodeTest = Join-Path $repo 'test/family-cloudflare-readonly-inventory.test.mjs'
$requiredBranch = 'family/cloudflare-windows-owner-audit-2026-10-29'
$oldLocation = (Get-Location).Path
$secretHandle = [IntPtr]::Zero
$secureToken = $null
$plainToken = $null

try {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        throw 'Node.js is not installed or not available in PATH.'
    }
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw 'Git is not installed or not available in PATH.'
    }

    Set-Location $repo
    $branch = (& git branch --show-current 2>$null).Trim()
    if ($LASTEXITCODE -ne 0 -or $branch -ne $requiredBranch) {
        throw "Wrong branch. Check out '$requiredBranch' in this local repository first. No audit was run."
    }
    if (-not (Test-Path -LiteralPath $nodeScript) -or -not (Test-Path -LiteralPath $nodeTest)) {
        throw 'The validated audit script or test file is missing. No audit was run.'
    }

    Write-Host '1/2: Checking GET-only audit behavior with fake Cloudflare responses...' -ForegroundColor Cyan
    & node --test $nodeTest
    if ($LASTEXITCODE -ne 0) {
        throw 'Local audit tests failed. Real Cloudflare inspection was NOT attempted.'
    }
    if ($TestsOnly) {
        Write-Host 'Tests passed. Cloudflare account was NOT queried.' -ForegroundColor Green
        return
    }

    Write-Host '2/2: Cloudflare account inventory. No Worker, route, Access, or Durable Object will be modified.' -ForegroundColor Cyan
    Write-Host 'Account ID: obtain this from Cloudflare dashboard. Token: short-lived, Workers Metadata Read-Only + Access Apps and Policies Read.'
    $accountId = (Read-Host 'Cloudflare account ID (32 hexadecimal characters)').Trim()
    if ($accountId -notmatch '^[A-Fa-f0-9]{32}$') {
        throw 'Invalid account ID. No Cloudflare query was attempted.'
    }

    $secureToken = Read-Host 'Paste a newly issued READ-ONLY Cloudflare API token (input hidden)' -AsSecureString
    if ($null -eq $secureToken -or $secureToken.Length -lt 16) {
        throw 'Token missing or too short. No Cloudflare query was attempted.'
    }

    # Secret is short-lived in THIS process and inherited only by its Node child.
    # It is never placed in a command-line argument or the output report.
    $secretHandle = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
    $plainToken = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secretHandle)
    $env:CLOUDFLARE_ACCOUNT_ID = $accountId
    $env:CLOUDFLARE_READONLY_API_TOKEN = $plainToken
    $plainToken = $null

    Write-Host 'Reading Workers, Access applications and Durable Object namespace metadata (GET only)...'
    & node $nodeScript
    if ($LASTEXITCODE -ne 0) {
        throw 'Cloudflare read-only inventory was incomplete or rejected. NO-GO. Check read-only permissions locally.'
    }
    Write-Host 'Read-only inventory returned. Release verdict remains NO-GO pending independent review.' -ForegroundColor Yellow
    Write-Host 'Only share the sanitized result after checking it for internal infrastructure metadata.'
}
catch {
    Write-Host ('CRESCO_CF_ACCOUNT_AUDIT_NO_GO: ' + $_.Exception.Message) -ForegroundColor Red
    throw 'Local audit halted. No deployment or account mutation was performed.'
}
finally {
    Remove-Item Env:\CLOUDFLARE_READONLY_API_TOKEN -ErrorAction SilentlyContinue
    Remove-Item Env:\CLOUDFLARE_ACCOUNT_ID -ErrorAction SilentlyContinue
    $plainToken = $null
    $secureToken = $null
    if ($secretHandle -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretHandle)
    }
    Set-Location $oldLocation
}