# Replit Deployment Guide

## 🎯 Replit - Free & Easy Deployment

### Prerequisites
- Replit account (sign up at https://replit.com)

## Deployment Steps

### Method 1: Import dari GitHub (Recommended)

#### 1. Login ke Replit
- Go to https://replit.com
- Sign up / Login (bisa pakai Google/GitHub)

#### 2. Import Repository
1. Klik **"+ Create Repl"**
2. Pilih tab **"Import from GitHub"**
3. Paste URL: `https://github.com/lutfi238/bot-discord-ai`
4. Klik **"Import from GitHub"**

#### 3. Set Environment Variables (Secrets)
1. Di sidebar kiri, klik icon **🔒 Secrets** (Tools → Secrets)
2. Tambahkan secrets berikut:

```
Key: BOT_TOKEN
Value: MTI4Nzc3MjgxODk2NDIyMTk1Mg.GXsCqu.59HOkHEE8fUg-nmD0-zsPVOJOkIlAZi7oJLhEA

Key: CLIENT_ID
Value: 1287772818964221952

Key: OPENROUTER_API_KEY
Value: sk-2qjmuq3OeucGNnsziYOh2Gh19g1IOCdvhK2L4xQk7MCEyTJH

Key: OPENROUTER_MODEL
Value: claude-sonnet-4-5

Key: OPENROUTER_BASE_URL
Value: https://api.cometapi.com/v1
```

#### 4. Update Code untuk Membaca Secrets
Replit menggunakan `process.env` yang sama, jadi code sudah compatible! ✅

#### 5. Run Bot
- Klik tombol **"Run"** di atas
- Bot akan start!
- Lihat console, harusnya muncul "Logged in as [bot name]!"

### Method 2: Manual Upload

1. Create new Repl → Node.js
2. Upload semua file (kecuali node_modules)
3. Set Secrets seperti di atas
4. Run!

## Keep Bot Always Online (24/7)

### Option 1: Replit Always On (Paid - $7/month)
- Paling reliable
- Klik "Deployments" → Enable "Always On"

### Option 2: UptimeRobot (FREE)
Tambahkan web server sederhana untuk di-ping:

1. Install express:
```bash
npm install express
```

2. Tambahkan di `index.js` (sebelum `client.login()`):
```javascript
// Keep-alive server for UptimeRobot
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Keep-alive server running on port ${PORT}`);
});
```

3. Setup UptimeRobot:
   - Daftar di https://uptimerobot.com (FREE)
   - Add New Monitor → HTTP(s)
   - URL: (copy URL Repl kamu, contoh: `https://bot-discord-ai.username.repl.co`)
   - Monitoring Interval: 5 minutes
   - Save!

UptimeRobot akan ping setiap 5 menit, jadi bot tidak sleep! ✅

## Troubleshooting

### Bot stops after some time
- Free Replit will sleep after inactivity
- Solution: Pakai UptimeRobot keep-alive (lihat di atas)

### "Cannot find module"
```bash
npm install
```

### Want to restart bot
- Klik "Stop" lalu "Run" lagi
- Atau klik icon ⟳ (restart)

## Advantages
- ✅ IDE built-in (bisa edit code langsung)
- ✅ Auto-install dependencies
- ✅ Easy to debug
- ✅ Free tier available
- ✅ GitHub sync

## Free Tier Limits
- Bot akan sleep setelah 1 jam tanpa activity
- Pakai UptimeRobot untuk keep alive (100% legal & free)
- Atau upgrade ke Always On ($7/mo) untuk fully reliable 24/7

## Update Bot
- Edit code di Replit IDE
- Atau sync dari GitHub (Git panel di sidebar)
