const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Check if standalone server exists
const standalonePath = path.join(__dirname, '..', '.next', 'standalone', 'server.js');
const nextPath = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');

let scriptPath;
let args = [];

if (fs.existsSync(standalonePath)) {
  // Use standalone server
  console.log('✅ Using standalone server');
  scriptPath = 'node';
  args = [standalonePath];
} else if (fs.existsSync(nextPath)) {
  // Fallback to regular Next.js
  console.log('⚠️  Standalone not found, using Next.js start');
  scriptPath = nextPath;
  args = ['start', '-p', process.env.PORT || '3000'];
} else {
  console.error('❌ Error: Next.js not found. Please run "npm run build" first.');
  process.exit(1);
}

// Start the server
const server = spawn(scriptPath, args, {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || '3000',
    DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/dev.db'
  },
  shell: true
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  process.exit(code || 0);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
});







