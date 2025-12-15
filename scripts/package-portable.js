const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.join(__dirname, '..', 'dist-portable');
const appName = 'lucky-draw-system';

console.log('📦 Creating portable package...');

// Clean and create dist directory
if (fs.existsSync(distDir)) {
  try {
    fs.rmSync(distDir, { recursive: true, force: true });
  } catch (error) {
    console.error('⚠️  Warning: Could not delete existing dist-portable folder.');
    console.error('   Please close any file explorers or programs using this folder.');
    console.error('   Or manually delete the dist-portable folder and try again.');
    process.exit(1);
  }
}
fs.mkdirSync(distDir, { recursive: true });

// Create package structure
const packageDir = path.join(distDir, appName);
fs.mkdirSync(packageDir, { recursive: true });

console.log('📋 Copying files...');

// Copy .next/standalone (this contains server.js and all app files)
if (fs.existsSync('.next/standalone')) {
  console.log('  - Copying .next/standalone');
  fs.cpSync('.next/standalone', path.join(packageDir, '.next', 'standalone'), { recursive: true });
}

// Copy .next/static - MUST be a sibling of .next/standalone (not inside it)
// Next.js standalone server expects .next/static at the same level as .next/standalone
// Structure: .next/standalone/ and .next/static/ (siblings)
// Also copy inside standalone as backup since server.js changes cwd
if (fs.existsSync('.next/static')) {
  console.log('  - Copying .next/static (sibling of standalone)');
  fs.mkdirSync(path.join(packageDir, '.next'), { recursive: true });
  fs.cpSync('.next/static', path.join(packageDir, '.next', 'static'), { recursive: true });
  
  // Also copy inside standalone folder as backup (server.js changes cwd to standalone)
  console.log('  - Copying .next/static to standalone folder (backup)');
  const standaloneStaticPath = path.join(packageDir, '.next', 'standalone', '.next', 'static');
  fs.mkdirSync(path.dirname(standaloneStaticPath), { recursive: true });
  fs.cpSync('.next/static', standaloneStaticPath, { recursive: true });
}

// Copy prisma directory
if (fs.existsSync('prisma')) {
  console.log('  - Copying prisma');
  fs.mkdirSync(path.join(packageDir, 'prisma'), { recursive: true });
  // Copy schema.prisma (needed for Prisma client)
  if (fs.existsSync('prisma/schema.prisma')) {
    fs.copyFileSync('prisma/schema.prisma', path.join(packageDir, 'prisma', 'schema.prisma'));
  }
  // Copy migrations if they exist
  if (fs.existsSync('prisma/migrations')) {
    fs.cpSync('prisma/migrations', path.join(packageDir, 'prisma', 'migrations'), { recursive: true });
  }
}

// Copy node_modules/.prisma (Prisma client generated files)
// These are needed for the application to run
const prismaClientPath = path.join('node_modules', '.prisma');
const prismaClientDistPath = path.join('node_modules', '@prisma', 'client');
if (fs.existsSync(prismaClientPath)) {
  console.log('  - Copying Prisma client');
  const targetPrismaPath = path.join(packageDir, 'node_modules', '.prisma');
  fs.mkdirSync(targetPrismaPath, { recursive: true });
  fs.cpSync(prismaClientPath, targetPrismaPath, { recursive: true });
}
if (fs.existsSync(prismaClientDistPath)) {
  const targetPrismaClientPath = path.join(packageDir, 'node_modules', '@prisma', 'client');
  fs.mkdirSync(path.dirname(targetPrismaClientPath), { recursive: true });
  fs.cpSync(prismaClientDistPath, targetPrismaClientPath, { recursive: true });
}

// Copy public directory - MUST be inside standalone folder because server.js changes cwd to standalone
// The standalone server expects public/ relative to where server.js is located (.next/standalone/)
if (fs.existsSync('public')) {
  console.log('  - Copying public to standalone folder');
  const standalonePublicPath = path.join(packageDir, '.next', 'standalone', 'public');
  fs.cpSync('public', standalonePublicPath, { recursive: true });
}

// Create start script for Windows
const startScriptWin = `@echo off
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
node .next\\standalone\\server.js
pause
`;

fs.writeFileSync(path.join(packageDir, 'start.bat'), startScriptWin);

// Create start script for Linux/Mac
const startScriptUnix = `#!/bin/bash
echo "Starting Lucky Draw System..."
echo ""
echo "Server will start on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""
cd "$(dirname "$0")"
# Set working directory to package root (where .next/static and public are)
export NODE_ENV=production
export PORT=3000
export DATABASE_URL="file:./prisma/dev.db"
node .next/standalone/server.js
`;

fs.writeFileSync(path.join(packageDir, 'start.sh'), startScriptUnix);
// Make it executable on Unix systems
try {
  execSync(`chmod +x "${path.join(packageDir, 'start.sh')}"`);
} catch (e) {
  // Ignore on Windows
}

// Create README
const readme = `# Lucky Draw System - Portable Package

## Requirements

- Node.js 18+ installed on the system
- Port 3000 available (or set PORT environment variable)

## How to Run

### Windows:
Double-click \`start.bat\` or run:
\`\`\`bash
start.bat
\`\`\`

### Linux/Mac:
\`\`\`bash
./start.sh
\`\`\`

Or manually:
\`\`\`bash
node .next/standalone/server.js
\`\`\`

## Access the Application

Open your browser and go to: http://localhost:3000

## Database

The SQLite database will be created automatically in the \`prisma\` directory on first run.

## Configuration

You can set environment variables:
- \`PORT\` - Change the port (default: 3000)
- \`DATABASE_URL\` - Override database location

Example:
\`\`\`bash
PORT=8080 node .next/standalone/server.js
\`\`\`
`;

fs.writeFileSync(path.join(packageDir, 'README.txt'), readme);

// Create .env.example
const envExample = `DATABASE_URL="file:./prisma/dev.db"
PORT=3000
`;

fs.writeFileSync(path.join(packageDir, '.env.example'), envExample);

// Create a checklist file
const checklist = `# Deployment Checklist

## Before Transferring:
- [ ] Run 'npm run build:portable' on source PC
- [ ] Verify the package was created successfully
- [ ] Check that all files are in dist-portable/lucky-draw-system/

## On Target PC:
- [ ] Install Node.js 18+ (if not already installed)
- [ ] Copy the entire 'lucky-draw-system' folder
- [ ] Navigate to the folder in terminal
- [ ] Run 'start.bat' (Windows) or './start.sh' (Linux/Mac)
- [ ] Open http://localhost:3000 in browser

## If Issues Occur:
- [ ] Check Node.js version: node --version (should be 18+)
- [ ] Check if port 3000 is available
- [ ] Verify all files were copied (especially .next/standalone and .next/static)
- [ ] Check terminal for error messages
- [ ] Ensure database directory (prisma/) exists and is writable

## Important Notes:
- The database (prisma/dev.db) will be created automatically on first run
- Do NOT delete the .next/standalone or .next/static folders
- Do NOT delete the node_modules/.prisma folder (if included)
- The application requires Node.js to run (not a standalone executable)
`;

fs.writeFileSync(path.join(packageDir, 'DEPLOYMENT_CHECKLIST.txt'), checklist);

console.log('✅ Portable package created at:', packageDir);
console.log('');
console.log('📝 Next steps:');
console.log('  1. Install Node.js 18+ on the target machine');
console.log('  2. Copy the entire folder to the target machine');
console.log('  3. Run start.bat (Windows) or start.sh (Linux/Mac)');
console.log('  4. Open http://localhost:3000 in your browser');
console.log('');
console.log('⚠️  Important: The target PC must have Node.js 18+ installed!');
console.log('   The portable package still requires Node.js to run.');

