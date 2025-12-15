#!/bin/bash
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
