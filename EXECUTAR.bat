@echo off
cls
echo ================================================================================
echo                    JUNTAR ARQUIVOS TXT
echo ================================================================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao instalado!
    echo.
    echo Instale em: https://www.python.org/downloads/
    echo IMPORTANTE: Marque "Add Python to PATH" na instalacao
    echo.
    pause
    exit /b 1
)

python "%~dp0juntar_txts.py"
pause
