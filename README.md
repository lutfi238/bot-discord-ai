# Discord AI Bot with Comet API (Claude Sonnet 4.5)

🤖 Discord bot yang menggunakan Claude Sonnet 4.5 melalui Comet API untuk memberikan respons AI yang cerdas.

## Features
- ✅ `/ask` - Tanya pertanyaan ke AI (Claude Sonnet 4.5)
- ✅ `/clear` - Hapus riwayat percakapan
- ✅ Streaming response real-time
- ✅ DM support
- ✅ Conversation history per channel

## Tech Stack
- **Discord.js** v14 - Discord bot framework
- **Comet API** - Claude Sonnet 4.5 access
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
BOT_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
OPENROUTER_API_KEY=your_comet_api_key_here
OPENROUTER_MODEL=claude-sonnet-4-5
OPENROUTER_BASE_URL=https://api.cometapi.com/v1
```

**Cara mendapatkan credentials:**
- **Discord Bot Token**: https://discord.com/developers/applications
- **Comet API Key**: https://cometapi.com

### 4. Deploy Commands
```bash
npm run deploy
```

### 5. Run Bot Locally
```bash
npm start
```

## Deployment (FREE Hosting)

### Option 1: Replit (Recommended - FREE 24/7)
1. Import repository di https://replit.com
2. Set Secrets (environment variables)
3. Run bot
4. Setup UptimeRobot untuk keep-alive

📖 [Panduan lengkap Replit](REPLIT_DEPLOYMENT.md)

### Option 2: Render.com (FREE)
1. Connect GitHub di https://render.com
2. Set environment variables
3. Deploy!

📖 [Panduan lengkap Render](RENDER_DEPLOYMENT.md)

### Option 3: Fly.io (FREE with credit card)
📖 [Panduan lengkap Fly.io](FLY_DEPLOYMENT.md)

## Commands

### `/ask <question>`
Tanya pertanyaan ke AI.

**Options:**
- `dm: true` - Kirim reply via DM
- `stream: true/false` - Enable/disable streaming response

**Example:**
```
/ask question: Jelaskan apa itu React
```

### `/clear`
Hapus riwayat percakapan di channel saat ini.

## Project Structure
```
bot-discord-ai/
├── commands/          # Slash commands
│   ├── ask.js        # /ask command
│   └── clear.js      # /clear command
├── utils/            # Utility functions
│   ├── api.js        # API call handlers
│   ├── embeds.js     # Discord embeds
│   ├── formatting.js # Message formatting
│   └── prompt.js     # System prompt
├── index.js          # Main bot file
├── deploy-commands.js # Command deployment
├── .env.example      # Environment template
└── package.json      # Dependencies
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `BOT_TOKEN` | Discord bot token | `MTI4Nzc3...` |
| `CLIENT_ID` | Discord application client ID | `1287772818964221952` |
| `OPENROUTER_API_KEY` | Comet API key | `sk-...` |
| `OPENROUTER_MODEL` | AI model to use | `claude-sonnet-4-5` |
| `OPENROUTER_BASE_URL` | API base URL | `https://api.cometapi.com/v1` |

## Free Tier Limits

### Comet API
- Check pricing: https://cometapi.com/pricing

### Replit
- Free tier dengan UptimeRobot = 24/7 uptime
- 1GB RAM, 1 vCPU

### Render.com
- 750 jam/bulan (cukup untuk 24/7)
- Bot sleep setelah 15 menit idle

## Contributing
Pull requests are welcome! Untuk perubahan besar, mohon buka issue terlebih dahulu.

## License
ISC

## Support
Jika ada pertanyaan atau issue, silakan buka [GitHub Issues](https://github.com/lutfi238/bot-discord-ai/issues)

---

Made with ❤️ using Claude Sonnet 4.5