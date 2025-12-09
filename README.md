# Discord AI Bot with Algion API (Gemini 3 Pro Preview)

🤖 Discord bot yang menggunakan Gemini 3 Pro Preview melalui Algion API (Free OpenAI-compatible API) untuk memberikan respons AI yang cerdas.

## Features

- ✅ `/ask` - Tanya pertanyaan ke AI (Gemini 3 Pro Preview)
- ✅ `/clear` - Hapus riwayat percakapan
- ✅ Streaming response real-time
- ✅ DM support
- ✅ Conversation history per channel
- ✅ 100% GRATIS - Algion API free forever!

## Tech Stack

- **Discord.js** v14 - Discord bot framework
- **Algion API** - Free OpenAI-compatible API
- **Gemini 3 Pro Preview** - Google's latest AI model
- **Node.js** - Runtime environment

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/lutfi238/bot-discord-ai.git
cd bot-discord-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` dan isi dengan credentials Anda:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Discord Bot
BOT_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here

# Algion API
ALGION_API_KEY=free
ALGION_MODEL=gemini-3-pro-preview
ALGION_BASE_URL=https://api.algion.dev/v1
```

**Cara mendapatkan credentials:**

- **Discord Bot Token**: https://discord.com/developers/applications
- **Algion API Key**: https://t.me/AlgionBot (Telegram bot - FREE!)
  - Atau gunakan `free` sebagai API key (default)

### 4. Deploy Commands

```bash
npm run deploy
```

### 5. Run Bot Locally

```bash
npm start
```

```

## Deployment (FREE Hosting)

**Cara mendapatkan credentials:**

- **Discord Bot Token**: https://discord.com/developers/applications### Option 1: Replit (Recommended - FREE 24/7)

- **Groq API Key**: https://console.groq.com/keys (FREE!)1. Import repository di https://replit.com

2. Set Secrets (environment variables)

### 4. Deploy Commands3. Run bot

```bash4. Setup UptimeRobot untuk keep-alive

node deploy-commands.js

```📖 [Panduan lengkap Replit](REPLIT_DEPLOYMENT.md)



### 5. Start Bot### Option 2: Render.com (FREE)

```bash1. Connect GitHub di https://render.com

npm start2. Set environment variables

```3. Deploy!



## 💬 Usage📖 [Panduan lengkap Render](RENDER_DEPLOYMENT.md)



### `/ask [question] [stream]`### Option 3: Fly.io (FREE with credit card)

Bertanya ke AI dengan LLaMA 3.3 70B model.📖 [Panduan lengkap Fly.io](FLY_DEPLOYMENT.md)



**Options:**## Commands

- `question` (required): Pertanyaan Anda

- `stream` (optional): Enable/disable streaming (default: true)### `/ask <question>`

Tanya pertanyaan ke AI.

**Contoh:**

```**Options:**

/ask question: Jelaskan cara kerja neural network- `dm: true` - Kirim reply via DM

/ask question: Buatkan kode Python untuk sorting stream: false- `stream: true/false` - Enable/disable streaming response

```

**Example:**

### `/clear````

Mulai percakapan baru dan lihat statistik:/ask question: Jelaskan apa itu React

- Memory usage```

- Active conversations

- Groq API rate limit usage (requests & tokens)### `/clear`

Hapus riwayat percakapan di channel saat ini.

## ⚠️ Rate Limit Handling

## Project Structure

Bot akan otomatis mendeteksi dan menampilkan pesan rate limit:```

bot-discord-ai/

```├── commands/          # Slash commands

⏱️ Groq API Rate Limit Reached│   ├── ask.js        # /ask command

│   └── clear.js      # /clear command

⏱️ Rate Limit: Requests Per Minute├── utils/            # Utility functions

Reached limit of 30 requests/minute. Current: 30/30│   ├── api.js        # API call handlers

│   ├── embeds.js     # Discord embeds

⏰ Please try again in: 45 seconds│   ├── formatting.js # Message formatting

```│   └── prompt.js     # System prompt

├── index.js          # Main bot file

Rate limiter melacak:├── deploy-commands.js # Command deployment

- ✅ Requests per minute (30)├── .env.example      # Environment template

- ✅ Requests per day (1000)└── package.json      # Dependencies

- ✅ Tokens per minute (12K)```

- ✅ Tokens per day (100K)

## Environment Variables

## 🎯 Rate Limit Stats

| Variable | Description | Example |

Gunakan `/clear` untuk melihat usage saat ini:|----------|-------------|---------|

| `BOT_TOKEN` | Discord bot token | `MTI4Nzc3...` |

```| `CLIENT_ID` | Discord application client ID | `1287772818964221952` |

📊 Groq API Usage (Requests)| `OPENROUTER_API_KEY` | Comet API key | `sk-...` |

Minute: 15/30 (50%)| `OPENROUTER_MODEL` | AI model to use | `claude-sonnet-4-5` |

Day: 234/1000 (23%)| `OPENROUTER_BASE_URL` | API base URL | `https://api.cometapi.com/v1` |



🎯 Groq API Usage (Tokens)## Free Tier Limits

Minute: 5,432/12,000 (45%)

Day: 45,678/100,000 (46%)### Comet API

```- Check pricing: https://cometapi.com/pricing



## 💾 Memory Optimization### Replit

- Free tier dengan UptimeRobot = 24/7 uptime

Bot dioptimalkan untuk hosting dengan RAM 500MB:- 1GB RAM, 1 vCPU



- Heap limit: 350MB### Render.com

- Auto garbage collection- 750 jam/bulan (cukup untuk 24/7)

- Conversation cleanup (30 min expiry)- Bot sleep setelah 15 menit idle

- Max 50 conversations

- Max 6 messages per conversation## Contributing

Pull requests are welcome! Untuk perubahan besar, mohon buka issue terlebih dahulu.

Lihat `MEMORY_OPTIMIZATION.md` untuk detail lengkap.

## License

## 🌐 DeploymentISC



### Wispbyte## Support

```bashJika ada pertanyaan atau issue, silakan buka [GitHub Issues](https://github.com/lutfi238/bot-discord-ai/issues)

bash start.sh

```---



### ReplitMade with ❤️ using Claude Sonnet 4.5
```bash
npm run replit
```

### Docker
```bash
docker build -t discord-bot .
docker run --memory=500m -e GROQ_API_KEY=xxx discord-bot
```

### Fly.io
```bash
fly deploy
```

## 📁 Project Structure

```
bot-discord-ai/
├── commands/
│   ├── ask.js           # Main AI command with rate limiting
│   └── clear.js         # Clear conversation & show stats
├── utils/
│   ├── api.js           # Groq API integration
│   ├── groqRateLimit.js # Rate limit manager
│   ├── memoryMonitor.js # Memory usage tracking
│   ├── formatting.js    # Message formatting
│   ├── prompt.js        # System prompts
│   └── embeds.js        # Discord embeds
├── index.js             # Main bot file
├── deploy-commands.js   # Command deployment
├── package.json         # Dependencies
├── .env.example         # Environment template
├── README.md            # This file
├── MEMORY_OPTIMIZATION.md
└── DEPLOYMENT.md
```

## 🔍 Monitoring

### Memory Usage
Bot logs memory setiap 15 menit:
```
📊 Bot Ready: Heap 45/89MB | RSS 125MB
📊 Periodic Check: Heap 52/89MB | RSS 145MB
```

### Rate Limits
Bot tracks rate limits secara real-time dan menampilkan warning:
```
⚠️ HIGH MEMORY WARNING: 455MB RSS
🧹 Emergency cleanup: removed 25 conversations
```

## 🆘 Troubleshooting

### Rate Limit Error
```
Error: Rate limit exceeded
```
**Solusi:** Tunggu sesuai waktu yang ditampilkan bot. Rate limit akan reset otomatis.

### Out of Memory
```
JavaScript heap out of memory
```
**Solusi:** 
1. Gunakan `/clear` di semua channel
2. Restart bot
3. Kurangi `MAX_CONVERSATIONS` di `index.js`

### Bot Not Responding
1. Cek log untuk error
2. Verify Groq API key valid
3. Pastikan rate limit tidak exceeded
4. Restart bot

## 📚 Documentation

- [Memory Optimization Guide](MEMORY_OPTIMIZATION.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Groq API Docs](https://console.groq.com/docs)
- [Discord.js Guide](https://discordjs.guide/)

## ⚡ Why Groq?

- **Ultra-fast**: 10x faster than traditional APIs
- **Free tier**: Generous limits for small projects
- **LLaMA 3.3 70B**: State-of-the-art open model
- **Low latency**: Perfect for real-time chat
- **OpenAI compatible**: Easy migration

## 🔗 Links

- **Repository**: https://github.com/lutfi238/bot-discord-ai
- **Groq Console**: https://console.groq.com
- **Discord Developer Portal**: https://discord.com/developers/applications

## 📝 License

ISC

## 👤 Author

lutfi238

## 🙏 Credits

- Groq for ultra-fast LLM inference
- Meta for LLaMA 3.3 model
- Discord.js community

---

**Made with ❤️ and optimized for 500MB RAM hosting**
