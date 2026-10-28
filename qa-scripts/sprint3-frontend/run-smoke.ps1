# API-MARKET Sprint 3 Frontend QA - Smoke Test Runner
param(
  [string]$Project = "chromium"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API-MARKET - SPRINT 3 SMOKE TESTS     " -ForegroundColor Cyan
Write-Host "  Project: $Project                     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

npx playwright test --grep "@smoke" --project=$Project --config=sprint3-frontend/playwright.config.ts
if ($LASTEXITCODE -ne 0) {
  Write-Host "[FAILURE] Smoke tests failed with exit code $LASTEXITCODE" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "[SUCCESS] All Smoke tests passed!" -ForegroundColor Green
exit 0
