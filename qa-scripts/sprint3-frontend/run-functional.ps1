# API-MARKET Sprint 3 Frontend QA - Functional Test Runner (Phases 1-8)
param(
  [string]$Project = "chromium"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API-MARKET - FUNCTIONAL SUITES (01-08)" -ForegroundColor Cyan
Write-Host "  Project: $Project                     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$functionalSpecs = @(
  "sprint3-frontend/tests/01-marketplace.spec.ts",
  "sprint3-frontend/tests/02-api-detail.spec.ts",
  "sprint3-frontend/tests/03-api-playground.spec.ts",
  "sprint3-frontend/tests/04-try-sandbox.spec.ts",
  "sprint3-frontend/tests/05-pricing.spec.ts",
  "sprint3-frontend/tests/06-checkout.spec.ts",
  "sprint3-frontend/tests/07-compare-apis.spec.ts",
  "sprint3-frontend/tests/08-navigation-layout.spec.ts"
)

npx playwright test $functionalSpecs --project=$Project --config=sprint3-frontend/playwright.config.ts
if ($LASTEXITCODE -ne 0) {
  Write-Host "[FAILURE] Functional tests failed with exit code $LASTEXITCODE" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "[SUCCESS] All Functional tests passed!" -ForegroundColor Green
exit 0
