# ==============================================================================
# scripts/chay-tat-ca-sprint4.ps1
# Kịch bản tự động hóa kiểm thử tích hợp toàn diện Sprint 4 (Comprehensive QA Suite)
# QA Lead: Tran Ha Thao Van (@vuonghathaovan-gif)
# Tiêu chuẩn: Ghi nhận exit code thật, thời gian chạy thật, parse số test thực tế
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Continue"

Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "HE THONG KIEM THU TICH HOP TOAN BO SPRINT 4 (FULL VERIFICATION SUITE)" -ForegroundColor Cyan
Write-Host "QA Lead: Tran Ha Thao Van (@vuonghathaovan-gif)" -ForegroundColor Cyan
Write-Host "Thoi diem thuc thi: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan

# 1. Nap cau hinh bien moi truong an toan tu .env neu chua co trong tien trinh
$envFile = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -match "^([A-Za-z0-9_]+)=(.*)$") {
            $key = $matches[1]
            $val = $matches[2].Trim()
            if (-not [System.Environment]::GetEnvironmentVariable($key)) {
                [System.Environment]::SetEnvironmentVariable($key, $val)
            }
        }
    }
}

if (-not $env:DATABASE_URL) {
    Write-Error "LOI BAT BUOC: Khong tim thay bien moi truong DATABASE_URL de ket noi PostgreSQL."
    exit 1
}

# Dam bao PG_TEST_URL va REDIS_TEST_URL san sang cho test runner
if (-not $env:PG_TEST_URL) {
    $env:PG_TEST_URL = $env:DATABASE_URL
}
if (-not $env:REDIS_TEST_URL) {
    $env:REDIS_TEST_URL = "redis://127.0.0.1:6379"
}

$results = [System.Collections.Generic.List[PSCustomObject]]::new()
$hasFailed = $false

function Run-Step {
    param (
        [string]$StepId,
        [string]$Name,
        [string]$Command,
        [scriptblock]$Action
    )

    Write-Host "`n--- [${StepId}] Dang chay: ${Name}..." -ForegroundColor Yellow
    Write-Host "    Lenh: ${Command}" -ForegroundColor Gray

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $exitCode = 0
    $output = ""

    try {
        $output = & $Action
        $exitCode = $LASTEXITCODE
    } catch {
        $exitCode = 1
        $output = $_.Exception.Message
    }
    $sw.Stop()
    $durationSec = [math]::Round($sw.Elapsed.TotalSeconds, 2)

    return @{
        StepId = $StepId
        Name = $Name
        Command = $Command
        Duration = $durationSec
        ExitCode = $exitCode
        RawOutput = $output
    }
}

# --- BUOC 1: LINT & TYPESCRIPT BUILD ---
$step1 = Run-Step "1" "Lint and TypeScript Build" "npm run lint && npm run build" {
    npm run lint 2>&1
    if ($LASTEXITCODE -ne 0) { return "Lint that bai" }
    npm run build 2>&1
}
$step1Success = ($step1.ExitCode -eq 0)
$step1Status = if ($step1Success) { "PASS" } else { "FAIL" }
$results.Add([PSCustomObject]@{
    Step = "1. Lint and Build"
    Command = "npm run lint && build"
    Duration = "$($step1.Duration)s"
    Details = if ($step1Success) { "TypeScript build sach, 0 loi kieu" } else { "Loi compile hoac lint" }
    ExitCode = $step1.ExitCode
    Status = $step1Status
})
if (-not $step1Success) { $hasFailed = $true }

# --- BUOC 2: FRONTEND VITEST SUITE ---
$step2 = Run-Step "2" "Frontend Unit and Component Tests (Vitest)" "npm --prefix frontend test" {
    npm --prefix frontend test 2>&1
}
$step2Out = [string]($step2.RawOutput -join "`n")
$vitestMatch = [regex]::Match($step2Out, "Tests\s+([0-9]+)\s+passed\s+\(([0-9]+)\)")
$vitestSummary = if ($vitestMatch.Success) { "$($vitestMatch.Groups[1].Value) tests passed" } else { "Exit $($step2.ExitCode)" }
$step2Status = if ($step2.ExitCode -eq 0) { "PASS" } else { "FAIL" }
$results.Add([PSCustomObject]@{
    Step = "2. Frontend Vitest"
    Command = "npm --prefix frontend test"
    Duration = "$($step2.Duration)s"
    Details = $vitestSummary
    ExitCode = $step2.ExitCode
    Status = $step2Status
})
if ($step2.ExitCode -ne 0) { $hasFailed = $true }

# --- BUOC 3: BACKEND TEST SUITE (run-tests.mjs) ---
$step3 = Run-Step "3" "Backend Integration and Unit Tests" "node scripts/run-tests.mjs" {
    node scripts/run-tests.mjs 2>&1
}
$step3Out = [string]($step3.RawOutput -join "`n")
$backendPassMatch = [regex]::Match($step3Out, "pass\s+([0-9]+)")
$backendSummary = if ($backendPassMatch.Success) { "$($backendPassMatch.Groups[1].Value) tests pass" } else { "Exit $($step3.ExitCode)" }
$step3Status = if ($step3.ExitCode -eq 0) { "PASS" } else { "FAIL" }
$results.Add([PSCustomObject]@{
    Step = "3. Backend Integration"
    Command = "node scripts/run-tests.mjs"
    Duration = "$($step3.Duration)s"
    Details = $backendSummary
    ExitCode = $step3.ExitCode
    Status = $step3Status
})
if ($step3.ExitCode -ne 0) { $hasFailed = $true }

# --- BUOC 4: RUNNER TRUY VET SPRINT 4 (sprint4-full-runner.cjs) ---
$step4 = Run-Step "4" "Sprint 4 Acceptance QA Runner" "node qa-scripts/sprint4-full-runner.cjs" {
    node qa-scripts/sprint4-full-runner.cjs 2>&1
}
$step4Status = if ($step4.ExitCode -eq 0) { "PASS" } else { "FAIL" }
$results.Add([PSCustomObject]@{
    Step = "4. Acceptance Runner"
    Command = "node sprint4-full-runner.cjs"
    Duration = "$($step4.Duration)s"
    Details = "Static groups and runtime-suite references"
    ExitCode = $step4.ExitCode
    Status = $step4Status
})
if ($step4.ExitCode -ne 0) { $hasFailed = $true }

# --- BUOC 5: CROSS-VERIFICATION 4 TANG (test-cross-verification-4tier.cjs) ---
$step5 = Run-Step "5" "Cross-Verification 4 Tiers (TC-HIST-04)" "node qa-scripts/test-cross-verification-4tier.cjs" {
    node qa-scripts/test-cross-verification-4tier.cjs 2>&1
}
$step5Status = if ($step5.ExitCode -eq 0) { "PASS" } else { "FAIL" }
$results.Add([PSCustomObject]@{
    Step = "5. 4-Tier Sync (HIST-04)"
    Command = "node test-cross-verification-4tier.cjs"
    Duration = "$($step5.Duration)s"
    Details = "Redis(+1) -> DB(+1) -> View(+1) -> UI(+1)"
    ExitCode = $step5.ExitCode
    Status = $step5Status
})
if ($step5.ExitCode -ne 0) { $hasFailed = $true }

# --- BUOC 6: RUNTIME GAPS BO SUNG (test-runtime-gaps.cjs) ---
$step6 = Run-Step "6" "Runtime Gaps (GW-05, RED-01, OVH-05)" "node qa-scripts/test-runtime-gaps.cjs" {
    node qa-scripts/test-runtime-gaps.cjs 2>&1
}
$step6Status = if ($step6.ExitCode -eq 0) { "PASS" } else { "FAIL" }
$results.Add([PSCustomObject]@{
    Step = "6. Runtime Gaps"
    Command = "node test-runtime-gaps.cjs"
    Duration = "$($step6.Duration)s"
    Details = "SQLi 401, to_jsonb 0 leaked, P95 do that"
    ExitCode = $step6.ExitCode
    Status = $step6Status
})
if ($step6.ExitCode -ne 0) { $hasFailed = $true }

# --- BUOC 7: GATEWAY BENCHMARK ---
$step7 = Run-Step "7" "Gateway Benchmark (SLA Performance)" "node scripts/run-tests.mjs --benchmark" {
    node scripts/run-tests.mjs --benchmark 2>&1
}
$step7Out = [string]($step7.RawOutput -join "`n")
$benchJson = [regex]::Match($step7Out, '\{[\s\S]*"benchmark"[\s\S]*\}')
$benchDetail = if ($benchJson.Success) {
    $bObj = $benchJson.Value | ConvertFrom-Json
    "App P95=$($bObj.applicationP95Ms)ms, Stored P95=$($bObj.storedP95Ms)ms (SLA < 30ms)"
} else {
    "Hoan tat do tai"
}
$step7Status = if ($step7.ExitCode -eq 0) { "PASS" } else { "FAIL" }
$results.Add([PSCustomObject]@{
    Step = "7. Benchmark SLA"
    Command = "node run-tests.mjs --benchmark"
    Duration = "$($step7.Duration)s"
    Details = $benchDetail
    ExitCode = $step7.ExitCode
    Status = $step7Status
})
if ($step7.ExitCode -ne 0) { $hasFailed = $true }

# --- BUOC 8: PLAYWRIGHT E2E UI ---
$step8 = Run-Step "8" "Playwright E2E UI Suite" "node qa-scripts/sprint4-ui-e2e-runner.cjs" {
    node qa-scripts/sprint4-ui-e2e-runner.cjs 2>&1
}
$step8Out = [string]($step8.RawOutput -join "`n")
$pwMatch = [regex]::Match($step8Out, "Passed:\s+([0-9]+)/([0-9]+)")
$pwDetail = if ($pwMatch.Success) {
    "$($pwMatch.Groups[1].Value)/$($pwMatch.Groups[2].Value) E2E scenarios passed"
} else {
    "No E2E count reported (exit $($step8.ExitCode))"
}
$step8Status = if ($step8.ExitCode -eq 0) { "PASS" } else { "FAIL" }
$results.Add([PSCustomObject]@{
    Step = "8. Playwright E2E"
    Command = "node sprint4-ui-e2e-runner.cjs"
    Duration = "$($step8.Duration)s"
    Details = $pwDetail
    ExitCode = $step8.ExitCode
    Status = $step8Status
})
if ($step8.ExitCode -ne 0) { $hasFailed = $true }

# --- TONG KET BANG BAO CAO TOAN SPRINT 4 ---
Write-Host "`n"
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "BANG TONG HOP KET QUA KIEM THU TOAN BO SPRINT 4" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan

$results | Format-Table -AutoSize Step, Command, Duration, ExitCode, Status, Details

Write-Host ("=" * 80) -ForegroundColor Cyan
if ($hasFailed) {
    Write-Host "[KET QUA TONG QUAN]: CO BUOC KIEM THU THAT BAI" -ForegroundColor Red
    exit 1
} else {
    Write-Host "[KET QUA TONG QUAN]: TOAN BO CAC BUOC KIEM THU THUC THI HOAN TOAN XANH!" -ForegroundColor Green
    exit 0
}
