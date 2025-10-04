# 🚀 Quick Deployment Guide for 500MB RAM Hosting

## ✅ Changes Summary

Your bot has been optimized for 500MB RAM hosting with the following improvements:

### Memory Optimizations Applied:
1. ✅ Reduced heap size to 350MB (was 400MB)
2. ✅ Enabled garbage collection with `--expose-gc`
3. ✅ Reduced conversation history from 20 to 6 messages
4. ✅ Limited total conversations to 50 (auto-cleanup)
5. ✅ Auto-expire conversations after 30 minutes
6. ✅ Disabled Discord.js caching
7. ✅ Truncate long messages (4000 chars max)
8. ✅ Emergency memory protection at 450MB
9. ✅ Periodic cleanup every 10 minutes
10. ✅ Memory monitoring every 15 minutes

## 📊 Expected Memory Usage

- **Startup**: ~120-150MB
- **Normal operation**: ~150-250MB
- **Heavy use**: ~250-350MB
- **Emergency cleanup**: Triggers at 450MB

## 🔧 Deployment Steps

### Step 1: Deploy Commands
```powershell
node deploy-commands.js
```

### Step 2: Start Bot
```powershell
npm start
```

The bot will now run with:
```
node --max-old-space-size=350 --expose-gc --gc-interval=100 index.js
```

## 🎯 Testing Memory Optimization

### Test 1: Check Startup Memory
Look for log message:
```
📊 Bot Ready: Heap XXmb/XXmb | RSS XXXmb
```

### Test 2: Use the Bot
Send `/ask` commands and watch for:
```
📊 Periodic Check: Heap XXmb/XXmb | RSS XXXmb
```

### Test 3: Check Cleanup
Wait 10+ minutes to see:
```
🧹 Cleaned X expired conversations. Active: X
```

### Test 4: Memory Stats
Use `/clear` to see current memory:
```
💾 Memory: XXmb | Active conversations: X
```

### Test 5: Emergency Protection
If memory gets high, you'll see:
```
⚠️ HIGH MEMORY WARNING: 455MB RSS (approaching 500MB limit)
🧹 Emergency cleanup: removed 25 conversations
```

## 📱 Platform-Specific Commands

### Wispbyte
```bash
bash start.sh
```

### Replit
```bash
npm run replit
```

### Docker
```bash
docker build -t discord-bot .
docker run --memory=500m --name discord-bot discord-bot
```

### Fly.io
```bash
fly deploy
```

## ⚠️ Important Notes

1. **Conversation Limits**:
   - Max 50 conversations total
   - Max 6 messages per conversation (3 exchanges)
   - Auto-expire after 30 minutes

2. **Message Truncation**:
   - Questions truncated at 1000 chars
   - Responses truncated at 4000 chars
   - This prevents memory bloat

3. **DM Feature**:
   - ✅ **REMOVED** - Bot now works in servers only
   - This saves memory by not needing DM intents

4. **Streaming**:
   - Default is ON for better memory usage
   - Use `stream:false` only if needed

## 🐛 Troubleshooting

### Still getting OOM (Out of Memory)?

#### Solution 1: Reduce Conversation Limits
Edit `index.js`:
```javascript
const MAX_CONVERSATIONS = 30; // Reduce from 50
```

#### Solution 2: Reduce Message History
Edit `commands/ask.js`:
```javascript
const MAX_MESSAGES = 4; // Reduce from 6
```

#### Solution 3: Lower Memory Limit
Edit `package.json`:
```json
"start": "node --max-old-space-size=300 --expose-gc --gc-interval=100 index.js"
```

#### Solution 4: Increase Cleanup Frequency
Edit `index.js`:
```javascript
setInterval(() => {
    // ...cleanup code...
}, 5 * 60 * 1000); // 5 minutes instead of 10
```

### Memory Keeps Growing?

1. Check for active conversations:
   ```
   Use /clear in each channel
   ```

2. Restart the bot regularly:
   ```
   Every 24 hours or when memory > 400MB
   ```

3. Enable more aggressive GC:
   ```
   --gc-interval=50 (instead of 100)
   ```

## 📈 Monitoring Tips

### Watch the Logs
```
📊 Bot Ready: Heap 45/89MB | RSS 125MB          # Good!
📊 Periodic Check: Heap 52/89MB | RSS 145MB     # Good!
⚠️ HIGH MEMORY WARNING: 455MB RSS               # Warning!
🧹 Emergency cleanup: removed 25 conversations  # Auto-fixed!
```

### Use `/clear` Frequently
Encourage users to run `/clear` to free memory:
```
✅ New chat started. Previous context cleared.
💾 Memory: 48MB | Active conversations: 15
```

### Monitor Platform Dashboard
Check your hosting platform's dashboard for:
- Memory usage graphs
- Crash logs
- Performance metrics

## 🎉 Success Indicators

Your bot is running well if you see:
- ✅ Memory stays below 350MB
- ✅ No crash/restart loops
- ✅ Automatic cleanups working
- ✅ Responses are fast
- ✅ `/clear` shows low memory usage

## 📚 Additional Resources

- `MEMORY_OPTIMIZATION.md` - Detailed optimization guide
- `README.md` - General setup instructions
- `utils/memoryMonitor.js` - Memory monitoring code

## 🆘 Support

If issues persist:
1. Check Node.js version: `node --version` (should be 18.x+)
2. Verify RAM limit: Check your hosting platform specs
3. Review logs: Look for memory-related errors
4. Consider upgrading: Paid tiers usually have more RAM

---

**Last Updated**: October 2025
**Optimized For**: 500MB RAM hosting (Wispbyte, Replit, etc.)
**Status**: Production Ready ✅
