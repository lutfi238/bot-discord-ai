# Render Deployment Guide

## 🎯 Render.com - 100% FREE, No Credit Card Required!

### Prerequisites
- GitHub account
- Render account (sign up at https://render.com)

## Deployment Steps

### 1. Sign Up / Login to Render
- Go to https://render.com
- Sign up dengan GitHub (lebih mudah)

### 2. Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `lutfi238/bot-discord-ai`
3. Configure:
   - **Name**: `bot-discord-ai`
   - **Region**: Singapore (closest to Indonesia)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**

### 3. Add Environment Variables
Di bagian "Environment", tambahkan:

```
BOT_TOKEN = MTI4Nzc3MjgxODk2NDIyMTk1Mg.GXsCqu.59HOkHEE8fUg-nmD0-zsPVOJOkIlAZi7oJLhEA
CLIENT_ID = 1287772818964221952
OPENROUTER_API_KEY = sk-2qjmuq3OeucGNnsziYOh2Gh19g1IOCdvhK2L4xQk7MCEyTJH
OPENROUTER_MODEL = claude-sonnet-4-5
OPENROUTER_BASE_URL = https://api.cometapi.com/v1
NODE_ENV = production
```

### 4. Deploy
- Click **"Create Web Service"**
- Wait for deployment (3-5 minutes)
- Bot akan auto-start! 🚀

## Features
- ✅ **100% FREE** - No credit card needed
- ✅ 750 jam/bulan (cukup untuk 24/7)
- ✅ Auto-deploy dari GitHub
- ✅ Free SSL
- ⚠️ Bot akan sleep setelah 15 menit tidak ada activity (auto wake-up saat ada command)

## Keep Bot Awake (Optional)
Jika ingin bot selalu online tanpa sleep, bisa:
1. Upgrade ke paid plan ($7/month) untuk unlimited uptime
2. Atau pakai cron-job.org untuk ping setiap 10 menit (tapi ini hack, not recommended)

## Monitor Bot
- View logs: Render Dashboard → Your Service → Logs
- Restart: Render Dashboard → Manual Deploy → "Clear build cache & deploy"

## Auto-Deploy
Setiap kali push ke GitHub, Render akan auto-deploy! 

## Troubleshooting
- Jika bot tidak respond: Check logs di Render Dashboard
- Jika build error: Pastikan `package.json` sudah benar
- Jika bot offline: Free tier akan sleep setelah 15 menit idle (normal behavior)

## Cost
- **FREE tier**: Perfect untuk personal use & friends
- **Paid tier** ($7/mo): Jika butuh 24/7 tanpa sleep
