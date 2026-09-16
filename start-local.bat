@echo off
cd /d "%~dp0"
py -3 -c "import sys" >nul 2>&1
if not errorlevel 1 (
    py -3 start_local.py
    goto done
)
python -c "import sys; assert sys.version_info.major == 3" >nul 2>&1
if not errorlevel 1 (
    python start_local.py
    goto done
)
echo Python 3 was not found.
echo Open localisator.html directly, or install Python 3 to run the local server.
:done
pause
