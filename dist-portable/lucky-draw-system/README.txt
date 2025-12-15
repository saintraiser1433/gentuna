# Lucky Draw System - Portable Package

## Requirements

- Node.js 18+ installed on the system
- Port 3000 available (or set PORT environment variable)

## How to Run

### Windows:
Double-click `start.bat` or run:
```bash
start.bat
```

### Linux/Mac:
```bash
./start.sh
```

Or manually:
```bash
node .next/standalone/server.js
```

## Access the Application

Open your browser and go to: http://localhost:3000

## Database

The SQLite database will be created automatically in the `prisma` directory on first run.

## Configuration

You can set environment variables:
- `PORT` - Change the port (default: 3000)
- `DATABASE_URL` - Override database location

Example:
```bash
PORT=8080 node .next/standalone/server.js
```
