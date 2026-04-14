@echo off
cd /d "%~dp0"
echo Serving Midnight Harvest at http://127.0.0.1:4173
echo Press Ctrl+C to stop the server.
py -3 -m http.server 4173 --bind 127.0.0.1
