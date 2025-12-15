# PM2 Quick Start Guide

## Installation

```bash
npm install -g pm2
```

## Deployment Steps

### 1. Build the Application

```bash
npm run build
```

### 2. Start with PM2

```bash
npm run pm2:start
```

Or:
```bash
pm2 start ecosystem.config.js
```

**Note:** PM2 will show `start-server.js` as the process name instead of "next-server" for a cleaner display.

### 3. Check Status

```bash
pm2 status
```

You should see:
```
┌─────┬──────────────────────┬─────────┬─────────┬──────────┬─────────┐
│ id  │ name                 │ status  │ restart │ uptime   │ memory  │
├─────┼──────────────────────┼─────────┼─────────┼──────────┼─────────┤
│ 0   │ lucky-draw-system    │ online  │ 0       │ 5s       │ 45.2mb  │
└─────┴──────────────────────┴─────────┴─────────┴──────────┴─────────┘
```

### 4. Access the Application

Open your browser: **http://localhost:3000**

## Common Commands

```bash
# View logs
npm run pm2:logs

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop

# Monitor
npm run pm2:monit
```

## Auto-Start on Boot

```bash
# Save current processes
pm2 save

# Generate startup script (Linux/Mac)
pm2 startup

# Follow the instructions shown
```

## Update Application

```bash
npm run deploy
```

This will rebuild and restart the application.

## Troubleshooting

**Application won't start:**
```bash
pm2 logs lucky-draw-system --err
```

**Check if port is in use:**
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

**Restart everything:**
```bash
pm2 restart all
```

