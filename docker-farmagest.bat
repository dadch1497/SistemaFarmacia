@echo off
chcp 65001 > nul
title FarmaGest - Control de Docker

:menu
cls
echo ========================================================
echo         FarmaGest — Centro de Control Docker
echo ========================================================
echo.
echo   [1] Iniciar todo en Docker (Modo Desacoplado)
echo   [2] Detener todos los contenedores Docker
echo   [3] Ver Estado y Salud de los Contenedores
echo   [4] Ver Logs en Vivo de los Microservicios
echo   [5] Abrir Frontend Web en Navegador (Puerto 4250)
echo   [6] Abrir phpMyAdmin (Puerto 8092)
echo   [7] Abrir Eureka Discovery (Puerto 8761)
echo   [8] Abrir RabbitMQ Management (Puerto 15672)
echo   [9] Reconstruir Imagenes Docker (build)
echo   [0] Salir
echo.
set /p opt="Seleccione una opción [0-9]: "

if "%opt%"=="1" goto start_docker
if "%opt%"=="2" goto stop_docker
if "%opt%"=="3" goto status_docker
if "%opt%"=="4" goto logs_docker
if "%opt%"=="5" goto open_frontend
if "%opt%"=="6" goto open_pma
if "%opt%"=="7" goto open_eureka
if "%opt%"=="8" goto open_rabbit
if "%opt%"=="9" goto build_docker
if "%opt%"=="0" exit /b
goto menu

:start_docker
echo.
echo Levantando los 13 contenedores en Docker...
cd /d "%~dp0"
docker compose -f infra/docker-compose.yml up -d
echo.
echo Abriendo aplicacion web...
start "" "http://localhost:4250"
pause
goto menu

:stop_docker
echo.
echo Deteniendo todos los contenedores de FarmaGest...
cd /d "%~dp0"
docker compose -f infra/docker-compose.yml down
echo Contenedores detenidos.
pause
goto menu

:status_docker
echo.
cd /d "%~dp0"
docker compose -f infra/docker-compose.yml ps
echo.
pause
goto menu

:logs_docker
echo.
echo Presione Ctrl+C para salir de los logs.
cd /d "%~dp0"
docker compose -f infra/docker-compose.yml logs -f
pause
goto menu

:open_frontend
start "" "http://localhost:4250"
goto menu

:open_pma
start "" "http://localhost:8092"
goto menu

:open_eureka
start "" "http://localhost:8761"
goto menu

:open_rabbit
start "" "http://localhost:15672"
goto menu

:build_docker
echo.
echo Reconstruyendo imágenes de FarmaGest...
cd /d "%~dp0"
docker compose -f infra/docker-compose.yml build
echo Reconstrucción finalizada.
pause
goto menu
