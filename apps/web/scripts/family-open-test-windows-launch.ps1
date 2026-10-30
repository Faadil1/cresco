# Cresco Family open test — guarded Windows operator handoff.
# Default: local build and read-only Cloudflare checks; NEVER deploys.
# Explicit -Publish + human exact-name confirmation: new Worker ONLY.
# Does not mutate Colosseum/Stocklana or the existing Family Worker.
[CmdletBinding()]
param(
  [switch]$Publish,
  [switch]$SkipInstall
)
$ErrorActionPreference = "Stop"
$target = "cresco-family-open-test-web"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$web = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$expectedBranch = "family/open-one-click-tester-launch-prep-2026-10-30"
$reviewedSha = "878fad8517c29b2ea778f8f82e18093a057cf1bc"
$previousApi = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_CRESCO_API_URL", "Process")

function RunChecked {
  param([string]$Label, [scriptblock]$Action)
  Write-Host "CHECK $Label"
  & $Action
  if ($LASTEXITCODE -ne 0) { throw "$Label FAILED (exit=$LASTEXITCODE)" }
  Write-Host "PASS $Label"
}

try {
  Push-Location $web
  $branch = (& git -C $repo branch --show-current).Trim()
  if ($LASTEXITCODE -ne 0 -or $branch -ne $expectedBranch) { throw "WRONG_PREPARATION_BRANCH" }
  $dirty = (& git -C $repo status --porcelain) -join "`n"
  if ($LASTEXITCODE -ne 0 -or $dirty.Trim()) { throw "DIRTY_CHECKOUT_NO_GO" }
  $ancestor = (& git -C $repo merge-base $reviewedSha HEAD).Trim()
  if ($LASTEXITCODE -ne 0 -or $ancestor -ne $reviewedSha) { throw "FROZEN_PRODUCT_NOT_AN_ANCESTOR" }
  $changed = @(& git -C $repo diff --name-only $reviewedSha HEAD)
  if ($LASTEXITCODE -ne 0) { throw "GIT_DIFF_FAILED" }
  $allowed = @(
    '^docs/family/OPEN-TEST-',
    '^apps/web/scripts/prepare-family-open-test(\.test)?\.mjs$',
    '^apps/web/scripts/family-open-test-windows-launch\.ps1$',
    '^\.github/workflows/family-open-test-prep\.yml$'
  )
  foreach ($path in $changed) {
    if ($path -and -not @($allowed | Where-Object { $path -match $_ }).Count) {
      throw "FROZEN_PRODUCT_SOURCE_DIFF_NO_GO: $path"
    }
  }
  [Environment]::SetEnvironmentVariable("NEXT_PUBLIC_CRESCO_API_URL", $null, "Process")

  if (-not $SkipInstall) {
    # Inherited Linux npm ci lockfile mismatch: do not rewrite audited lockfile.
    RunChecked "install without changing frozen lockfile" {
      & npm install --no-save --package-lock=false --no-audit --no-fund
    }
  }
  RunChecked "seven negative config tests" { & node --test .\scripts\prepare-family-open-test.test.mjs }
  RunChecked "isolated Family browser-only build" { & npm run build:public-family }
  RunChecked "prepare separate open/close configs (NO DEPLOY)" {
    & node .\scripts\prepare-family-open-test.mjs --prepare-local-config
  }
  $openConfig = "dist/server/wrangler.family-open-test.json"
  $closeConfig = "dist/server/wrangler.family-open-test-closed.json"
  # PowerShell treats an empty PSCustomObject like {} as truthy. The old
  # condition ($cfg.vars -or $cfg.durable_objects ...) incorrectly rejected
  # generated configs with harmless empty objects even after Node had passed
  # the strict validation. Recheck the actual two JSON files structurally
  # against the validated build using the same fail-closed policy as CI.
  RunChecked "verify exact open/closed Worker config content (NO DEPLOY)" {
    & node .\scripts\prepare-family-open-test.mjs --verify-local-config
  }
  Write-Host "ISOLATED_WORKER_CONFIG=PASS ($target; no backend bindings, exact known Worker name)"

  # Only account-related operations are Cloudflare GET/read-only before -Publish.
  RunChecked "Wrangler Cloudflare account session (read-only)" { & npx --no-install wrangler whoami }
  # Native CLI errors can appear on stderr even when an unknown Worker is
  # expected. Collect the exit codes rather than converting stderr into a
  # terminating PowerShell error (especially on Windows PowerShell 5.1).
  $priorErrorAction = $ErrorActionPreference
  try {
    $ErrorActionPreference = "Continue"
    $knownDeployment = (& npx --no-install wrangler deployments list --name $target --json 2>&1 | Out-String)
    $deploymentExit = $LASTEXITCODE
    $knownVersions = (& npx --no-install wrangler versions list --name $target --json 2>&1 | Out-String)
    $versionsExit = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $priorErrorAction
  }
  if ($deploymentExit -eq 0 -or $versionsExit -eq 0) {
    throw "TARGET_NAME_ALREADY_RESPONDS_IN_CLOUDFLARE: abort rather than overwrite existing Worker. Check the correct Cloudflare account."
  }
  Write-Host "TARGET_EXISTENCE_NOT_PROVED: Wrangler did not return any successful deployment/version listing."
  Write-Host "Confirm in Cloudflare Dashboard > Workers & Pages that '$target' is ABSENT in the intended account."
  Write-Host "Do not treat CLI errors as proof that the Worker is absent."

  if (-not $Publish) {
    Write-Host "FAMILY_OPEN_TEST_PREFLIGHT=LOCAL_PASS_CLOUDFLARE_NAME_UNVERIFIED"
    Write-Host "NO DEPLOY. To publish only after confirming name unused, rerun with -Publish."
    exit 0
  }
  $unused = Read-Host "After checking Workers & Pages in the intended account, type exactly: NAME UNUSED $target"
  if ($unused -ne "NAME UNUSED $target") { throw "TARGET_ABSENCE_NOT_CONFIRMED" }
  $confirmation = Read-Host "To publish only the new Worker, type exactly: PUBLISH $target"
  if ($confirmation -ne "PUBLISH $target") { throw "PUBLISH_NOT_CONFIRMED" }
  RunChecked "DEPLOY $target ONLY" {
    & npx --no-install wrangler deploy --config $openConfig
  }
  Write-Host "FAMILY_OPEN_TEST_DEPLOY_COMMAND=SUCCESS"
  Write-Host "COPY THE ACTUAL WORKERS.DEV URL PRINTED BY WRANGLER (do not guess it)."
  Write-Host "Smoke-test GET / and /try, negative routes, and the Parent/Child practice flow BEFORE SHARING."
  Write-Host "To close ONLY this test Worker, after reviewing its identity, use:"
  Write-Host "npx --no-install wrangler deploy --config $closeConfig"
} catch {
  Write-Error "FAMILY_OPEN_TEST_LAUNCH_NO_GO: $($_.Exception.Message)"
  exit 1
} finally {
  [Environment]::SetEnvironmentVariable("NEXT_PUBLIC_CRESCO_API_URL", $previousApi, "Process")
  Pop-Location
}
