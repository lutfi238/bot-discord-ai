# Discord Bot - Wispbyte Deployment Guide

## 🚀 Optimized for Wispbyte Free Hosting

Bot ini telah dioptimasi khusus untuk hosting gratis Wispbyte dengan spesifikasi:
- **Memory**: 0.5 GiB
- **Storage**: 1 GiB  
- **CPU**: 100%

## 📋 Environment Variables (.env)

Pastikan file `.env` sudah dikonfigurasi dengan:
```
BOT_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
AIML_API_KEY=fb1c63adf46a4f74baecef928fa43ad5
AIML_MODEL=deepseek/deepseek-chat-v3.1
AIML_BASE_URL=https://api.aimlapi.com/v1
```

## 🔧 Optimasi untuk Free Hosting

1. **Memory Management**: 
   - Node.js heap size dibatasi 400MB
   - Conversation history dibatasi 10 pesan per user
   - Auto cleanup conversation lama

2. **Dependency Optimization**:
   - Production mode only
   - No audit/fund packages
   - Minimal logging

3. **AIML API Configuration**:
   - Conservative retry delays
   - Optimized for 10 requests/hour limit

## 📂 File Upload ke Wispbyte

Upload semua file ini ke server Wispbyte kamu:
- `index.js` (main bot file)
- `package.json` 
- `.env` (dengan token yang valid)
- `start.sh` (startup script)
- `commands/` (folder dengan command files)
- `utils/` (folder dengan utility files)
- `data/` (folder untuk database)

## 🏃‍♂️ Cara Menjalankan

1. Set startup command di Wispbyte console: `bash start.sh`
2. Atau manual: `npm start`

## 📊 Resource Monitoring

Bot akan otomatis:
- Membatasi penggunaan memory
- Cleanup conversation lama
- Restart otomatis jika crash
- Log memory usage

## 🆘 Troubleshooting

Jika bot crash karena memory:
1. Restart server di Wispbyte console
2. Check logs untuk memory usage
3. Kurangi MAX_MESSAGES jika perlu (di index.js line 151)

## 🎯 Features

- ✅ AIML API dengan DeepSeek v3.1
- ✅ Slash commands (/ask, /search, /clear)  
- ✅ Direct Messages support
- ✅ Memory optimized untuk free hosting
- ✅ Auto cleanup & restart

