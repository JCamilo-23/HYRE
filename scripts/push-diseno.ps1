$ErrorActionPreference = "Stop"
$log = Join-Path $PSScriptRoot "..\push-diseno.log"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$temp = Join-Path $env:TEMP "HYRE-push-temp"
$src = $repoRoot.Path

function Log($m) {
    $line = "$(Get-Date -Format o) $m"
    Add-Content -Path $log -Value $line
    Write-Host $line
}

try {
    Log "START push from $src"
    if (Test-Path $temp) {
        Remove-Item -Recurse -Force $temp
    }

    Log "Cloning https://github.com/JCamilo-23/HYRE.git"
    git clone https://github.com/JCamilo-23/HYRE.git $temp 2>&1 | ForEach-Object { Log $_ }
    if ($LASTEXITCODE -ne 0) { throw "clone failed ($LASTEXITCODE)" }

    Set-Location $temp
    git fetch --all 2>&1 | ForEach-Object { Log $_ }

    $devRemote = git ls-remote --heads origin dev 2>&1 | Out-String
    Log "origin/dev: $($devRemote.Trim())"
    if ($devRemote -notmatch "refs/heads/dev") {
        throw "dev branch does not exist on remote"
    }

    Log "Checkout dev"
    git checkout dev 2>&1 | ForEach-Object { Log $_ }
    git pull origin dev 2>&1 | ForEach-Object { Log $_ }

    Log "Create branch diseno from dev"
    git checkout -b diseno 2>&1 | ForEach-Object { Log $_ }

    Log "Copy local project files"
    robocopy $src $temp /E /XD .git node_modules .next scripts /NFL /NDL /NJH /NJS /nc /ns /np 2>&1 | ForEach-Object { Log $_ }

    git status 2>&1 | ForEach-Object { Log $_ }
    git add -A 2>&1 | ForEach-Object { Log $_ }

    $changes = git status --porcelain 2>&1 | Out-String
    if (-not [string]::IsNullOrWhiteSpace($changes)) {
        git commit -m "Add HYRE design prototype" 2>&1 | ForEach-Object { Log $_ }
        if ($LASTEXITCODE -ne 0) { throw "commit failed ($LASTEXITCODE)" }
    } else {
        Log "No file changes to commit"
    }

    Log "Push origin diseno"
    git push -u origin diseno 2>&1 | ForEach-Object { Log $_ }
    if ($LASTEXITCODE -ne 0) { throw "push failed ($LASTEXITCODE)" }

    Log "SUCCESS https://github.com/JCamilo-23/HYRE/tree/diseno"
} catch {
    Log "ERROR: $_"
    exit 1
}
