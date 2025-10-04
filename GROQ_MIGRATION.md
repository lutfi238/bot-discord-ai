# Migration Guide: Comet API → Groq API

## 🎯 Overview

This bot has been migrated from Comet API (Claude Sonnet 4.5) to Groq API (LLaMA 3.3 70B Versatile) for:
- ⚡ **Ultra-fast responses** (10x faster inference)
- 🆓 **Generous free tier** (30 RPM, 1000 RPD)
- 📊 **Built-in rate limiting** with user-friendly messages
- 💰 **Cost-effective** for high-volume usage

## 📋 What Changed

### Environment Variables
**Old (Comet API):**
```env
OPENROUTER_API_KEY=xxx
OPENROUTER_MODEL=claude-sonnet-4-5
OPENROUTER_BASE_URL=https://api.cometapi.com/v1
```

**New (Groq API):**
```env
GROQ_API_KEY=xxx
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

### New Files Added
1. **`utils/groqRateLimit.js`** - Comprehensive rate limit manager
   - Tracks 4 types of limits (RPM, RPD, TPM, TPD)
   - Provides user-friendly Discord messages
   - Auto-cleanup and monitoring

2. **`GROQ_MIGRATION.md`** - This file

### Modified Files
1. **`index.js`**
   - Changed API config from Comet to Groq
   - Updated status message
   - Added rate limit logging

2. **`utils/api.js`**
   - Added rate limit checking before requests
   - Records token usage from responses
   - Handles 429 errors gracefully
   - Updates rate limiter with response headers

3. **`commands/ask.js`**
   - Added rate limit handler callback
   - Shows formatted rate limit messages
   - Displays time until reset

4. **`commands/clear.js`**
   - Now shows rate limit stats
   - Beautiful embed with usage percentages
   - Tracks both requests and tokens

5. **`.env.example`**
   - Updated with Groq API variables
   - Added rate limit documentation

6. **`package.json`**
   - Updated description and version
   - Version bumped to 2.0.0

7. **`README.md`**
   - Completely rewritten for Groq
   - Added rate limit section
   - Updated examples and troubleshooting

8. **`start.sh`**
   - Updated startup messages

## 🔑 How to Get Groq API Key

1. Visit https://console.groq.com
2. Sign up with email or GitHub
3. Go to https://console.groq.com/keys
4. Click "Create API Key"
5. Copy the key (starts with `gsk_`)
6. Add to your `.env` file

**Important:** Keep your API key secret!

## 📊 Rate Limits

### Free Tier Limits
| Metric | Per Minute | Per Day |
|--------|------------|---------|
| Requests | 30 | 1,000 |
| Tokens | 12,000 | 100,000 |

### How Rate Limiting Works

1. **Before Request:**
   - Bot estimates token usage
   - Checks against all 4 limits
   - Blocks request if any limit exceeded

2. **After Request:**
   - Records actual token usage from response
   - Updates counters
   - Stores rate limit headers

3. **On Rate Limit:**
   - Shows friendly Discord embed
   - Displays exact time until reset
   - Specifies which limit was hit

### Rate Limit Messages

#### Requests Per Minute
```
⏱️ Groq API Rate Limit Reached

⏱️ Rate Limit: Requests Per Minute
Reached limit of 30 requests/minute. Current: 30/30

⏰ Please try again in: 1 minute 15 seconds
```

#### Tokens Per Day
```
⏱️ Groq API Rate Limit Reached

📊 Rate Limit: Tokens Per Day
Reached limit of 100,000 tokens/day. Current: 100,000/100,000

⏰ Please try again in: 6 hours 23 minutes
```

## 🎯 Rate Limit Stats

Use `/clear` to check current usage:

```
📊 Groq API Usage (Requests)
Minute: 15/30 (50%)
Day: 234/1000 (23%)

🎯 Groq API Usage (Tokens)
Minute: 5,432/12,000 (45%)
Day: 45,678/100,000 (46%)
```

## ⚠️ Breaking Changes

### 1. Environment Variables
You **must** update your `.env` file:
```bash
# Remove old variables
OPENROUTER_API_KEY
OPENROUTER_MODEL
OPENROUTER_BASE_URL

# Add new variables
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

### 2. Max Tokens
Reduced from 4096 → 2048 for better rate limit management.

### 3. Response Format
LLaMA 3.3 70B may have slightly different response style than Claude Sonnet 4.5, but quality is comparable.

## 🚀 Migration Steps

### Step 1: Update Environment
```bash
# Edit .env file
nano .env

# Add Groq API key
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

### Step 2: Deploy Commands
```bash
node deploy-commands.js
```

### Step 3: Restart Bot
```bash
npm start
```

### Step 4: Test
```
/ask question: Hello, test the new Groq API
/clear
```

You should see:
- Fast responses (< 1 second)
- Rate limit stats in `/clear`
- No errors

## 🔍 Verifying Migration

### Check Logs
Look for:
```
Logged in as YourBot#1234!
🚀 Using Groq API - Ultra-fast AI responses with LLaMA 3.3 70B!
💾 Memory optimized for 500MB RAM hosting
Model: llama-3.3-70b-versatile
📊 Rate Limits: 30 RPM, 1K RPD, 12K TPM, 100K TPD
```

### Test Commands
```bash
# Test basic ask
/ask question: What is 2+2?

# Test rate limit tracking
/clear

# Test streaming
/ask question: Write a long story stream: true
```

## 🐛 Troubleshooting

### Error: "GROQ_API_KEY is not defined"
**Solution:** Add `GROQ_API_KEY` to your `.env` file.

### Error: "Rate limit exceeded"
**Solution:** Wait for the time shown in the error message. Rate limits reset automatically.

### Responses are slower than expected
**Solution:** Groq is usually very fast. Check:
1. Your internet connection
2. Groq API status: https://status.groq.com
3. Rate limit usage with `/clear`

### Bot shows old "Claude Sonnet" in status
**Solution:** Restart the bot completely.

## 📈 Performance Comparison

| Metric | Comet API (Claude) | Groq API (LLaMA) |
|--------|-------------------|------------------|
| Average Response Time | 3-5 seconds | 0.5-1 second |
| Streaming Speed | Moderate | Very Fast |
| Free Tier RPM | Varies | 30 |
| Free Tier RPD | Varies | 1,000 |
| Token Limit/Request | 4,096 | 2,048 |
| Rate Limit Tracking | Manual | Automatic |

## 🎁 Benefits of Groq

### 1. Speed
- **10x faster** than traditional APIs
- Perfect for real-time chat
- Streaming is lightning fast

### 2. Cost
- **Generous free tier** (1000 requests/day)
- No credit card required
- Easy to upgrade if needed

### 3. Rate Limiting
- **Built-in tracking** with our rate limiter
- **User-friendly messages** in Discord
- **Automatic reset** handling

### 4. Compatibility
- **OpenAI-compatible** API
- Easy to switch models
- Supports streaming

## 🔄 Reverting (If Needed)

If you need to revert to Comet API:

1. Restore old `.env` variables
2. Revert `index.js`, `utils/api.js`, and `commands/*.js`
3. Remove `utils/groqRateLimit.js`
4. Deploy commands
5. Restart bot

**Note:** It's recommended to stay with Groq for better performance and rate limiting.

## 📚 Additional Resources

- [Groq API Documentation](https://console.groq.com/docs)
- [Groq Rate Limits](https://console.groq.com/docs/rate-limits)
- [LLaMA 3.3 Model Card](https://console.groq.com/docs/models)
- [Groq Status Page](https://status.groq.com)

## 🆘 Support

If you encounter issues:

1. Check `.env` file has correct Groq API key
2. Verify API key at https://console.groq.com/keys
3. Check rate limits with `/clear`
4. Review logs for errors
5. Open GitHub issue with logs

## ✅ Checklist

Before deploying to production:

- [ ] Updated `.env` with Groq API key
- [ ] Tested `/ask` command
- [ ] Tested `/clear` command
- [ ] Verified rate limit messages
- [ ] Checked memory usage
- [ ] Deployed commands
- [ ] Restarted bot
- [ ] Monitored for 24 hours

---

**Migration Date:** October 2025  
**Version:** 2.0.0  
**Status:** Production Ready ✅
