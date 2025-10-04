# Vercel Deployment Guide

⚠️ **WARNING**: Discord bots are NOT recommended for Vercel hosting because:
- Vercel is designed for serverless functions (request-response)
- Discord bots need persistent WebSocket connections
- Vercel has execution timeouts (60s max on free tier)
- Bot will disconnect frequently

## Better Alternatives:
1. **Railway** - https://railway.app (Recommended)
2. **Render** - https://render.com
3. **Fly.io** - https://fly.io

## If You Still Want to Try Vercel:

### Steps:
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Set Environment Variables in Vercel Dashboard:
   - `BOT_TOKEN`
   - `CLIENT_ID`
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL`
   - `OPENROUTER_BASE_URL`

### Expected Issues:
- ❌ Bot will disconnect after ~60 seconds
- ❌ Commands may not respond reliably
- ❌ High latency
- ❌ Not cost-effective for 24/7 operation

### Recommended: Use Railway Instead
Railway supports persistent connections and is perfect for Discord bots.
