@echo off
echo Starting QuickBooks Test App Development Environment

REM Start Next.js in one terminal window
start cmd /k "npm run dev"

REM Wait for Next.js to start
echo Waiting for Next.js to start...
timeout /t 5 /nobreak

REM Start ngrok in another terminal window
start cmd /k "node start-ngrok.js"

echo Development environment started!
echo Next.js: http://localhost:3000
echo ngrok: Check the ngrok terminal window for your public URL 