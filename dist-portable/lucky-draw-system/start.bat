@echo off
echo Starting Lucky Draw System...
echo.
echo Server will start on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
REM Set environment variables
set NODE_ENV=production
set PORT=3000
set DATABASE_URL=file:./prisma/dev.db
REM Start server from package root (server.js will change cwd to .next/standalone)
REM But .next/static must be at .next/static relative to package root
node .next\standalone\server.js
pause
