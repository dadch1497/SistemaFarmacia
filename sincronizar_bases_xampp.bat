@echo off
chcp 65001 >nul
echo ========================================================
echo   FarmaGest - Sincronizar Bases de Datos con XAMPP
echo ========================================================
echo.

if not exist "C:\xampp\mysql\bin\mysql.exe" (
    echo [ERROR] No se encontró MySQL en C:\xampp\mysql\bin\mysql.exe.
    echo Asegúrate de tener XAMPP instalado.
    pause
    exit /b 1
)

echo [1/2] Importando bases de datos en XAMPP MariaDB/MySQL...
"C:\xampp\mysql\bin\mysql.exe" -u root < "%~dp0backup_vps_actual.sql"

if %ERRORLEVEL% EQU 0 (
    echo [2/2] ¡Importación completada con éxito!
    echo.
    echo Las 6 bases de datos ya están disponibles en phpMyAdmin:
    echo  - db_auth
    echo  - db_catalogo
    echo  - db_compras
    echo  - db_inventario
    echo  - db_reportes
    echo  - db_ventas
    echo.
    echo Puedes verlas abriendo: http://localhost/phpmyadmin
) else (
    echo [ERROR] Hubo un problema al importar las bases de datos.
)

echo.
pause
