# Fix: Resources Not Found After Transfer

## Problem

When transferring the application to another PC, all resources (CSS, JavaScript, images) are not found (404 errors).

## Root Cause

Next.js standalone mode changes the working directory to `.next/standalone` when `server.js` runs. This means:
- Static files (`.next/static`) must be **inside** the standalone folder
- Public files (`public/`) must be **inside** the standalone folder
- The server looks for these files relative to where `server.js` is located

## Solution

The packaging script has been updated to place files in the correct locations:

### Correct Structure:
```
lucky-draw-system/
├── .next/
│   └── standalone/
│       ├── server.js
│       ├── .next/
│       │   └── static/    ← MUST be here!
│       └── public/        ← MUST be here!
├── prisma/
└── start.bat / start.sh
```

### What Was Fixed:

1. **Static files** (`.next/static`) are now copied to `.next/standalone/.next/static`
2. **Public files** (`public/`) are now copied to `.next/standalone/public`
3. **Start scripts** set the correct working directory

## How to Fix Existing Deployment

If you already transferred files and resources aren't working:

### Option 1: Rebuild and Transfer (Recommended)

1. On source PC, run:
   ```bash
   npm run build:portable
   ```

2. Copy the entire `dist-portable/lucky-draw-system/` folder to target PC

3. On target PC, run `start.bat` or `./start.sh`

### Option 2: Manual Fix on Target PC

If you already transferred files, manually fix the structure:

1. **Move static files:**
   ```bash
   # Windows
   xcopy /E /I .next\static .next\standalone\.next\static
   
   # Linux/Mac
   cp -r .next/static .next/standalone/.next/static
   ```

2. **Move public files:**
   ```bash
   # Windows
   xcopy /E /I public .next\standalone\public
   
   # Linux/Mac
   cp -r public .next/standalone/public
   ```

3. **Restart the server**

## Verification

After fixing, check that these paths exist:
- `.next/standalone/.next/static/` (contains CSS, JS files)
- `.next/standalone/public/` (contains images, sounds, etc.)

## Prevention

Always use `npm run build:portable` to create the deployment package. This ensures files are in the correct locations.

