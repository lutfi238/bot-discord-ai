#!/bin/bash

# Wispbyte Hosting Startup Script
# Optimized for free hosting with 0.5GB RAM limit

echo "Starting Discord Bot on Wispbyte..."
echo "Memory Limit: 0.5GB"
echo "Using AIML API with DeepSeek v3.1"

# Set environment variables for optimization
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=400 --gc-interval=100"

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

# Start the bot with memory optimization
echo "Starting bot with memory optimization..."
node --max-old-space-size=400 --gc-interval=100 index.js

