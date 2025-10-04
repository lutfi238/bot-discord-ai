# Memory Optimization Guide

## 500MB RAM Hosting Optimization

This bot has been optimized to run on hosting platforms with only **500MB RAM** (like free tiers of Wispbyte, Replit, etc.).

## Implemented Optimizations

### 1. **Node.js Flags**
```bash
--max-old-space-size=350    # Limit heap to 350MB
--expose-gc                  # Enable manual garbage collection
--gc-interval=100            # Run GC more frequently
--optimize-for-size          # Optimize for memory, not speed
```

### 2. **Discord.js Caching**
- Disabled most caches with `makeCache: () => null`
- Limited message cache to 10 messages
- Auto-sweep old messages every 5 minutes
- Remove cached users after 1 hour

### 3. **Conversation History**
- **Max 50 conversations** stored at once
- **6 messages per conversation** (3 exchanges) instead of 20
- **Auto-expire** conversations after 30 minutes of inactivity
- **Truncate long messages** to 4000 chars max
- **Auto-cleanup** every 10 minutes

### 4. **Memory Protection**
- **Emergency cleanup** when memory exceeds 450MB
- **Block new requests** if memory is critical
- **Force garbage collection** when needed
- **Periodic monitoring** every 15 minutes

### 5. **Response Optimization**
- Truncate AI responses over 4000 chars
- Limit message history in API calls
- Remove unused imports and modules

## Memory Usage Monitoring

The bot logs memory usage:
```
📊 Bot Ready: Heap 45/89MB | RSS 125MB
🧹 Cleaned 5 expired conversations. Active: 12
📊 Periodic Check: Heap 52/89MB | RSS 145MB
⚠️ HIGH MEMORY WARNING: 455MB RSS (approaching 500MB limit)
```

Use `/clear` command to see current memory stats:
```
✅ New chat started. Previous context cleared.
💾 Memory: 48MB | Active conversations: 15
```

## Best Practices

### For Users:
1. Use `/clear` regularly to free memory
2. Avoid very long questions (truncated at 1000 chars)
3. Use streaming mode (default) for better performance

### For Deployment:

#### Wispbyte
```bash
bash start.sh
```

#### Replit
```bash
npm run replit
```

#### Docker
```bash
docker build -t discord-bot .
docker run --memory=500m discord-bot
```

#### Fly.io
```bash
fly deploy
```

## Troubleshooting

### Bot crashes with "Out of Memory"
1. Reduce `MAX_CONVERSATIONS` from 50 to 30 in `index.js`
2. Reduce `MAX_MESSAGES` from 6 to 4 in `commands/ask.js`
3. Lower `--max-old-space-size` from 350 to 300

### High memory warnings
1. Run `/clear` in all active channels
2. Restart the bot to clear all conversations
3. Check if there are memory leaks with external tools

### Memory keeps growing
1. Enable garbage collection: `--expose-gc`
2. Reduce conversation expiry from 30 to 15 minutes
3. Reduce auto-cleanup interval from 10 to 5 minutes

## Memory Limits by Platform

| Platform | Free RAM | Recommended Settings |
|----------|----------|---------------------|
| Wispbyte | 512MB    | `--max-old-space-size=350` |
| Replit   | 512MB    | `--max-old-space-size=350` |
| Fly.io   | 256MB    | `--max-old-space-size=200` |
| Heroku   | 512MB    | `--max-old-space-size=350` |
| Railway  | 512MB    | `--max-old-space-size=350` |

## Advanced Configuration

Edit `index.js` to fine-tune:

```javascript
// Conversation limits
const MAX_CONVERSATIONS = 50;        // Total conversations stored
const CONVERSATION_EXPIRY = 30 * 60 * 1000; // 30 minutes

// Memory threshold
if (heapUsedMB > 450) {              // Emergency cleanup at 450MB
    // ...
}
```

Edit `commands/ask.js`:

```javascript
const MAX_MESSAGES = 6;              // Messages per conversation
const truncatedRaw = raw.length > 4000 
    ? raw.substring(0, 4000) + '...' 
    : raw;                           // Truncate responses
```

## Support

If you continue to experience memory issues:
1. Check your hosting platform's actual RAM limit
2. Verify Node.js version (18.x+ recommended)
3. Monitor with external tools like `pm2` or `nodemon`
4. Consider upgrading to a paid tier with more RAM

## License

This optimization guide is part of the bot-discord-ai project.
