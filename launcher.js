#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory where the executable is located
const appDir = path.dirname(process.execPath);
const isDev = process.env.NODE_ENV !== 'production';

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';

// Database path - use relative to executable location
const dbPath = path.join(appDir, 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

// Ensure prisma directory exists
const prismaDir = path.join(appDir, 'prisma');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

// Path to Next.js server
const nextServerPath = path.join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next');
const standaloneServerPath = path.join(appDir, '.next', 'standalone', 'server.js');

// Check if standalone build exists
let serverPath;
let serverArgs;

if (fs.existsSync(standaloneServerPath)) {
  // Use standalone server
  serverPath = 'node';
  serverArgs = [standaloneServerPath];
} else if (fs.existsSync(nextServerPath)) {
  // Use Next.js directly
  serverPath = nextServerPath;
  serverArgs = ['start', '-p', process.env.PORT];
} else {
  console.error('Error: Next.js server not found. Please run "npm run build" first.');
  process.exit(1);
}

// Start the server
const server = spawn(serverPath, serverArgs, {
  cwd: appDir,
  stdio: 'inherit',
  env: process.env,
  shell: true
});

// Handle server process
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







