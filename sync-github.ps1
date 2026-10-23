param(
    [string]$Mensaje = "Actualizacion automatica: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $env:Path = "C:\Program Files\Git\cmd;" + $env:Path
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      FarmaGest - Sincronizacion con GitHub" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot

Write-Host "`n[1/3] Descargando ultimos cambios de GitHub..." -ForegroundColor Yellow
git pull --rebase origin main

Write-Host "`n[2/3] Preparando y registrando cambios locales..." -ForegroundColor Yellow
git add .
$status = git status --porcelain
if ($status) {
    git commit -m "$Mensaje"
    Write-Host "Cambios registrados: $Mensaje" -ForegroundColor Green
} else {
    Write-Host "No hay cambios nuevos pendientes por registrar." -ForegroundColor DarkGray
}

Write-Host "`n[3/3] Subiendo cambios a GitHub (origin/main)..." -ForegroundColor Yellow
git push origin main

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host " Sincronizacion completada con exito en GitHub!" -ForegroundColor Green
Write-Host " Repositorio: https://github.com/dadch1497/SistemaFarmacia" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
