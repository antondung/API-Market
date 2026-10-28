# API-MARKET Sprint 3 Frontend QA - Full Comprehensive Test Suite Runner
param(
  [string]$Project = "chromium"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API-MARKET - FULL COMPREHENSIVE QA    " -ForegroundColor Cyan
Write-Host "  Project: $Project                     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

npx playwright test sprint3-frontend/tests/ --project=$Project --config=sprint3-frontend/playwright.config.ts
if ($LASTEXITCODE -ne 0) {
  Write-Host "[FAILURE] Test suite failed with exit code $LASTEXITCODE" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "[SUCCESS] All Sprint 3 Frontend QA tests passed!" -ForegroundColor Green
exit 0
