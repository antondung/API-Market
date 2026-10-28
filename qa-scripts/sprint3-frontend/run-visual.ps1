# API-MARKET Sprint 3 Frontend QA - Responsive & Visual Matrix Runner (Phase 9)
param(
  [string]$Project = "chromium"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API-MARKET - RESPONSIVE & VISUAL MATRIX" -ForegroundColor Cyan
Write-Host "  Project: $Project                     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

npx playwright test sprint3-frontend/tests/09-responsive-viewports.spec.ts --project=$Project --config=sprint3-frontend/playwright.config.ts
if ($LASTEXITCODE -ne 0) {
  Write-Host "[FAILURE] Visual & Responsive tests failed with exit code $LASTEXITCODE" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "[SUCCESS] All Visual & Responsive tests passed!" -ForegroundColor Green
exit 0
