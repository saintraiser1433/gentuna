#!/usr/bin/env node

/**
 * PM2 Server Launcher
 * This script starts the Next.js server and hides the "next-server" command from PM2
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get paths
const appDir = __dirname;
const standalonePath = path.join(appDir, '.next', 'standalone', 'server.js');
const nextPath = path.join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next');

// Determine which server to use
let serverPath;
let serverArgs = [];

if (fs.existsSync(standalonePath)) {
  // Use standalone server (recommended)
  serverPath = 'node';
  serverArgs = [standalonePath];
} else if (fs.existsSync(nextPath)) {
  // Fallback to Next.js
  serverPath = nextPath;
  serverArgs = ['start', '-p', process.env.PORT || '3000'];
} else {
  console.error('Error: Next.js server not found. Please run "npm run build" first.');
  process.exit(1);
}

// Set environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';

// Ensure database directory exists
const dbPath = path.join(appDir, 'prisma', 'dev.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Start the server
const server = spawn(serverPath, serverArgs, {
  cwd: appDir,
  stdio: 'inherit',
  env: process.env,
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
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
});

