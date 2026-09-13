@echo off
setlocal
echo =======================================================
echo    Officialum1 LLC - Developer Credit Scanner & Injector
echo =======================================================
echo.
echo 1. Scan current project
echo 2. Inject credits into current project
echo 3. Scan ALL Desktop projects
echo 4. Inject credits into ALL Desktop projects
echo 5. Scan specific project folder
echo.
set /p choice="Enter option (1-5): "

if "%choice%"=="1" (
    python "%~dp0scripts\auto_inject_credits.py" "%CD%"
) else if "%choice%"=="2" (
    python "%~dp0scripts\auto_inject_credits.py" "%CD%" --inject
) else if "%choice%"=="3" (
    python "%~dp0scripts\auto_inject_credits.py" --all-desktop
) else if "%choice%"=="4" (
    python "%~dp0scripts\auto_inject_credits.py" --all-desktop --inject
) else if "%choice%"=="5" (
    set /p targetpath="Enter folder path (e.g. C:\Users\Abc\Desktop\backerspro): "
    python "%~dp0scripts\auto_inject_credits.py" "%targetpath%" --inject
) else (
    echo Invalid choice.
)

echo.
pause
