@echo off
chcp 65001 > nul
title FarmaGest - Lanzador del Sistema

echo ========================================================
echo           Iniciando FarmaGest (Frontend + Backend)
echo ========================================================
echo.

cd /d "%~dp0"

:: Asegurar que node y npm estén en el PATH
set "PATH=%LOCALAPPDATA%\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64;%PATH%"

:: Cerrar procesos previos en puertos 8080, 8089 y 4200 si existieran
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8089 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4200 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

:: Detectar ejecutable de PHP para el microservicio SUNAT
set "PHP_BIN="
if exist "C:\xampp\php\php.exe" (
    set "PHP_BIN=C:\xampp\php\php.exe"
) else (
    where php >nul 2>&1
    if not errorlevel 1 (
        set "PHP_BIN=php"
    ) else if exist "C:\php\php.exe" (
        set "PHP_BIN=C:\php\php.exe"
    )
)

echo [1/3] Levantando Microservicio SUNAT Oficial en puerto 8089...
if defined PHP_BIN (
    echo     Usando PHP: %PHP_BIN%
    start "FarmaGest-SUNAT" /min cmd /c "%PHP_BIN% -S 127.0.0.1:8089 -t \"%~dp0backend\ms-sunat-php\public\""
) else (
    echo     [ADVERTENCIA] No se encontro PHP en el sistema.
    echo     Para emitir en vivo a SUNAT, instale XAMPP (C:\xampp\php) o PHP en el PATH.
)

echo [2/3] Levantando API Gateway ^& Microservicios en puerto 8080...
start "FarmaGest-Backend" /min cmd /c "node \"%~dp0backend\mock-server.js\""

echo [3/3] Levantando Frontend Web Angular en puerto 4200...
start "FarmaGest-Frontend" /min cmd /c "cd /d \"%~dp0frontend\farmagest-web\" && npm start"

echo.
<nul set /p="Esperando inicialización y compilación de FarmaGest"

:wait_loop
timeout /t 2 > nul
powershell -Command "try { $res = Invoke-WebRequest -Uri 'http://127.0.0.1:4200' -UseBasicParsing -TimeoutSec 1; if ($res.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" > nul 2>&1
if %ERRORLEVEL% neq 0 (
    <nul set /p=.
    goto wait_loop
)

echo.
echo [OK] ¡FarmaGest compilado y listo para usar!
echo.
echo Abriendo FarmaGest en tu navegador...
start http://localhost:4200

echo.
echo ========================================================
echo  ¡FarmaGest activo y funcionando correctamente!
echo  URL: http://localhost:4200
echo  Gateway: http://localhost:8080
echo  SUNAT Service: http://localhost:8089
echo ========================================================
echo Puedes cerrar esta ventana cuando desees.
timeout /t 5 > nul
