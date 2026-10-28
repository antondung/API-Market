# API-MARKET Sprint 3 Frontend QA - Accessibility (WCAG 2.2) Runner (Phase 11)
param(
  [string]$Project = "chromium"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API-MARKET - ACCESSIBILITY AUDIT (WCAG)" -ForegroundColor Cyan
Write-Host "  Project: $Project                     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

npx playwright test sprint3-frontend/tests/11-accessibility-wcag.spec.ts --project=$Project --config=sprint3-frontend/playwright.config.ts
if ($LASTEXITCODE -ne 0) {
  Write-Host "[FAILURE] Accessibility tests failed with exit code $LASTEXITCODE" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "[SUCCESS] All Accessibility tests passed!" -ForegroundColor Green
exit 0
