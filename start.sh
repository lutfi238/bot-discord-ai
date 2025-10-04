#!/bin/bash

# Wispbyte Hosting Startup Script
# Optimized for free hosting with 0.5GB RAM limit

echo "Starting Discord Bot on Wispbyte..."
echo "Memory Limit: 0.5GB"
echo "Using Claude Sonnet 4.5 via Comet API"

# Set environment variables for aggressive memory optimization
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=350 --expose-gc --gc-interval=100 --optimize-for-size"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production --no-audit --no-fund
fi

# Deploy commands if needed (first time setup)
if [ ! -f ".commands_deployed" ]; then
    echo "Deploying Discord commands..."
    node deploy-commands.js
    touch .commands_deployed
fi

# Start the bot with aggressive memory optimization
echo "Starting bot with aggressive memory optimization..."
node --max-old-space-size=350 --expose-gc --gc-interval=100 --optimize-for-size index.js

