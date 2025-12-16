# Deploying with PM2

This guide explains how to deploy the Lucky Draw System using PM2 process manager.

## Prerequisites

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

   This will:
   - Generate Prisma Client
   - Build Next.js in standalone mode
   - Create optimized production build

## Quick Start

### 1. Start the Application

```bash
npm run pm2:start
```

Or manually:
```bash
pm2 start ecosystem.config.js
```

### 2. Check Status

```bash
pm2 status
```

### 3. View Logs

```bash
npm run pm2:logs
```

Or:
```bash
pm2 logs lucky-draw-system
```

### 4. Monitor

```bash
npm run pm2:monit
```

## Available PM2 Commands

| Command | Description |
|---------|-------------|
| `npm run pm2:start` | Start the application |
| `npm run pm2:stop` | Stop the application |
| `npm run pm2:restart` | Restart the application |
| `npm run pm2:delete` | Delete the application from PM2 |
| `npm run pm2:logs` | View application logs |
| `npm run pm2:monit` | Open PM2 monitoring dashboard |
| `npm run deploy` | Build and restart the application |

## PM2 Management Commands

### View Application Status
```bash
pm2 status
pm2 list
```

### View Detailed Information
```bash
pm2 show lucky-draw-system
pm2 info lucky-draw-system
```

### View Logs
```bash
# All logs
pm2 logs lucky-draw-system

# Only error logs
pm2 logs lucky-draw-system --err

# Only output logs
pm2 logs lucky-draw-system --out

# Clear logs
pm2 flush
```

### Restart Application
```bash
pm2 restart lucky-draw-system
pm2 reload lucky-draw-system  # Zero-downtime reload
```

### Stop Application
```bash
pm2 stop lucky-draw-system
```

### Delete Application
```bash
pm2 delete lucky-draw-system
```

### Monitor Resources
```bash
pm2 monit
```

## Auto-Start on System Boot

### 1. Save Current PM2 Process List

```bash
pm2 save
```

### 2. Generate Startup Script

**Linux/Mac:**
```bash
pm2 startup
```

This will output a command. Run that command as shown.

**Windows:**
PM2 doesn't support auto-startup on Windows. Use Task Scheduler or a service manager instead.

### 3. Verify Auto-Start

Restart your system and check if PM2 starts automatically:
```bash
pm2 status
```

## Configuration

The PM2 configuration is in `ecosystem.config.js`. Key settings:

- **name**: Application name (`lucky-draw-system`)
- **script**: Server entry point (`.next/standalone/server.js`)
- **instances**: Number of instances (1 for single instance)
- **exec_mode**: Execution mode (`fork` for single instance)
- **max_memory_restart**: Restart if memory exceeds 500MB
- **autorestart**: Automatically restart on crashes
- **env**: Environment variables

### Customizing Port

Edit `ecosystem.config.js`:
```javascript
env: {
  PORT: 8080,  // Change to your desired port
  // ...
}
```

Then restart:
```bash
pm2 restart lucky-draw-system
```

### Customizing Database Location

Edit `ecosystem.config.js`:
```javascript
env: {
  DATABASE_URL: "file:./prisma/production.db",
  // ...
}
```

## Production Deployment Steps

### 1. Prepare the Server

```bash
# Install Node.js 18+ and npm
# Install PM2
npm install -g pm2

# Clone or copy your application
cd /path/to/application
```

### 2. Install Dependencies

```bash
npm install --production
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed initial data
npm run db:seed
```

### 4. Build the Application

```bash
npm run build
```

### 5. Start with PM2

```bash
pm2 start ecosystem.config.js
```

### 6. Set Up Auto-Start

```bash
pm2 save
pm2 startup
# Run the command shown by pm2 startup
```

### 7. Verify Deployment

```bash
# Check status
pm2 status

# Check logs
pm2 logs lucky-draw-system

# Test the application
curl http://localhost:3000
```

## Troubleshooting

### Application Not Starting

1. **Check logs:**
   ```bash
   pm2 logs lucky-draw-system --err
   ```

2. **Check if port is available:**
   ```bash
   # Linux/Mac
   lsof -i :3000
   
   # Windows
   netstat -ano | findstr :3000
   ```

3. **Verify build:**
   ```bash
   ls -la .next/standalone/server.js
   ```

### Database Issues

1. **Check database file:**
   ```bash
   ls -la prisma/dev.db
   ```

2. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Recreate database:**
   ```bash
   npx prisma db push --force-reset
   ```

### Memory Issues

If the application uses too much memory:

1. **Check memory usage:**
   ```bash
   pm2 monit
   ```

2. **Adjust max_memory_restart in ecosystem.config.js:**
   ```javascript
   max_memory_restart: "1G"  // Increase limit
   ```

### Application Keeps Restarting

1. **Check error logs:**
   ```bash
   pm2 logs lucky-draw-system --err
   ```

2. **Check restart count:**
   ```bash
   pm2 show lucky-draw-system
   ```

3. **Temporarily disable auto-restart:**
   ```bash
   pm2 stop lucky-draw-system
   pm2 start ecosystem.config.js --no-autorestart
   ```

## Updating the Application

### Method 1: Using Deploy Script

```bash
npm run deploy
```

This will:
1. Build the application
2. Restart PM2 process

### Method 2: Manual Update

```bash
# Pull latest code (if using git)
git pull

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart lucky-draw-system
```

## Monitoring and Maintenance

### View Real-Time Monitoring

```bash
pm2 monit
```

### View Statistics

```bash
pm2 show lucky-draw-system
```

### Export Metrics

```bash
pm2 jlist  # JSON format
pm2 prettylist  # Human-readable format
```

### Backup Database

```bash
# Copy database file
cp prisma/dev.db prisma/dev.db.backup
```

## Environment Variables

You can override environment variables in `ecosystem.config.js` or create a `.env` file:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
NODE_ENV=production
```

PM2 will automatically load `.env` file if present.

## Multiple Environments

You can create different configurations for different environments:

```javascript
module.exports = {
  apps: [
    {
      name: "lucky-draw-system-dev",
      // ... dev config
      env: {
        NODE_ENV: "development",
        PORT: 3000
      }
    },
    {
      name: "lucky-draw-system-prod",
      // ... prod config
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
```

Start with environment:
```bash
pm2 start ecosystem.config.js --env production
```

## Security Considerations

1. **Firewall**: Only expose necessary ports
2. **Environment Variables**: Don't commit sensitive data
3. **Database**: Secure the database file location
4. **HTTPS**: Use reverse proxy (nginx) for HTTPS
5. **Updates**: Keep dependencies updated

## Reverse Proxy Setup (Nginx Example)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Useful PM2 Commands Reference

```bash
# Process management
pm2 start <script>
pm2 stop <name>
pm2 restart <name>
pm2 delete <name>
pm2 reload <name>

# Information
pm2 list
pm2 status
pm2 show <name>
pm2 info <name>

# Logs
pm2 logs
pm2 logs <name>
pm2 flush

# Monitoring
pm2 monit
pm2 describe <name>

# Startup
pm2 save
pm2 startup
pm2 unstartup

# Other
pm2 kill  # Kill PM2 daemon
pm2 resurect  # Restore saved processes
pm2 update  # Update PM2
```







