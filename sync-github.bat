@echo off
chcp 65001 > nul
echo ========================================================
echo       FarmaGest - Sincronizacion Automatica con GitHub
echo ========================================================
echo.

cd /d "%~dp0"

:: Verificar ruta de git
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    set "PATH=C:\Program Files\Git\cmd;%PATH%"
)

set COMMIT_MSG=%*
if "%COMMIT_MSG%"=="" (
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set FECHA=%%c-%%b-%%a
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set HORA=%%a:%%b
    set COMMIT_MSG=Actualizacion automatica: %date% %time%
)

echo [1/3] Descargando ultimos cambios de GitHub...
git pull --rebase origin main

echo.
echo [2/3] Preparando y registrando cambios locales...
git add .
git diff --cached --quiet
if %ERRORLEVEL% equ 0 (
    echo No hay cambios nuevos pendientes por guardar.
) else (
    git commit -m "%COMMIT_MSG%"
)

echo.
echo [3/3] Subiendo cambios a GitHub (origin/main)...
git push origin main

echo.
echo ========================================================
echo Sincronizacion completada con exito en GitHub!
echo ========================================================
pause
