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

:: Cerrar procesos previos en puertos 8080 y 4200 si existieran
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4200 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo [1/2] Levantando API Gateway & Microservicios en puerto 8080...
start "FarmaGest-Backend" /min node "%~dp0backend\mock-server.js"

echo [2/2] Levantando Frontend Web Angular en puerto 4200...
start "FarmaGest-Frontend" /min cmd /c "cd /d "%~dp0frontend\farmagest-web" && npx ng serve --port 4200"

echo.
echo Esperando inicialización de servicios...
timeout /t 6 > nul

echo Abriendo FarmaGest en tu navegador...
start http://localhost:4200

echo.
echo ========================================================
echo  ¡FarmaGest activo y listo para usar!
echo  URL: http://localhost:4200
echo  Gateway: http://localhost:8080
echo ========================================================
timeout /t 3 > nul
