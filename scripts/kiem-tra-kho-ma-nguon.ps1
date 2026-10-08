$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$errors = [System.Collections.Generic.List[string]]::new()
$excludedDirectories = @('.git', 'node_modules', 'dist', 'build', 'coverage', 'bin', 'obj')
$textExtensions = @('.md', '.txt', '.json', '.yml', '.yaml', '.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.java', '.kt', '.cs', '.py', '.sql', '.xml', '.properties', '.env', '.example', '.sh', '.ps1')

$files = Get-ChildItem -Path $root -Recurse -File | Where-Object {
    $relativePath = $_.FullName.Substring($root.Length).TrimStart('\')
    $segments = $relativePath -split '[\\/]'
    -not ($segments | Where-Object { $excludedDirectories -contains $_ })
}

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($root.Length).TrimStart('\')
    if ($textExtensions -notcontains $file.Extension.ToLowerInvariant() -and $file.Name -notin @('.gitignore', '.gitattributes', 'Dockerfile')) {
        continue
    }

    $lines = Get-Content -LiteralPath $file.FullName -Encoding UTF8
    for ($index = 0; $index -lt $lines.Count; $index++) {
        $lineNumber = $index + 1
        $line = $lines[$index]

        if ($line -match '^(<<<<<<<|=======|>>>>>>>)') {
            $errors.Add("$relativePath`:$lineNumber chứa dấu conflict Git chưa xử lý.")
        }

        if ($line -match '[ \t]+$') {
            $errors.Add("$relativePath`:$lineNumber có khoảng trắng cuối dòng.")
        }
    }
}

$readme = Join-Path $root 'README.md'
if (-not (Test-Path -LiteralPath $readme)) {
    $errors.Add('Thiếu README.md ở thư mục gốc.')
} elseif ((Get-Item -LiteralPath $readme).Length -eq 0) {
    $errors.Add('README.md đang rỗng.')
}

if ($errors.Count -gt 0) {
    Write-Host 'Kiểm tra thất bại:' -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

Write-Host "Kiểm tra thành công: $($files.Count) tệp, không có lỗi nền tảng." -ForegroundColor Green
