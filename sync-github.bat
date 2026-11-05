@echo off
chcp 65001 > nul
title FarmaGest - Sincronizacion Automatica con GitHub
echo ========================================================
echo       FarmaGest - Sincronizacion Automatica con GitHub
echo ========================================================
echo.

cd /d "%~dp0"

:: Asegurar que Git y GitHub CLI estén en el PATH
set "PATH=C:\Users\DADCH1497\MinGit\cmd;C:\Program Files\GitHub CLI;C:\Program Files\Git\cmd;%PATH%"

set COMMIT_MSG=%*
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=feat(dashboard-reportes): reportes vendedor 1 y 2, concordancia con ventas, permisos inventario y devoluciones
)

:: Verificar autenticacion de GitHub CLI
where gh >nul 2>&1
if %ERRORLEVEL% equ 0 (
    gh auth status >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo [!] Se requiere autorizar el acceso a GitHub.
        echo Se abrira una ventana en su navegador para autorizar en 1 clic...
        echo.
        gh auth login --web --git-protocol https
        gh auth setup-git
    )
)

echo [1/3] Verificando cambios pendientes...
git add -A
git diff --cached --quiet
if %ERRORLEVEL% equ 0 (
    echo No hay cambios nuevos sin commitear.
) else (
    echo [2/3] Registrando commit local...
    git commit -m "%COMMIT_MSG%"
)

echo.
echo [3/3] Subiendo cambios a GitHub (origin/main)...
git push origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   ¡Todos los cambios fueron guardados con exito en GitHub!
    echo   Repositorio: https://github.com/dadch1497/SistemaFarmacia
    echo ========================================================
) else (
    echo.
    echo [!] Si el push solicita credenciales, ingrese su Personal Access Token o inicie sesion.
)
echo.
pause
