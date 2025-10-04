# Fly.io Deployment Guide

## Prerequisites
1. Create a Fly.io account at https://fly.io/app/sign-up
2. Install Fly CLI

### Install Fly CLI (Windows)
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

## Deployment Steps

### 1. Login to Fly.io
```bash
fly auth login
```

### 2. Create App (First time only)
```bash
fly apps create bot-discord-ai
```

### 3. Set Environment Variables
```bash
fly secrets set BOT_TOKEN="MTI4Nzc3MjgxODk2NDIyMTk1Mg.GXsCqu.59HOkHEE8fUg-nmD0-zsPVOJOkIlAZi7oJLhEA"
fly secrets set CLIENT_ID="1287772818964221952"
fly secrets set OPENROUTER_API_KEY="sk-2qjmuq3OeucGNnsziYOh2Gh19g1IOCdvhK2L4xQk7MCEyTJH"
fly secrets set OPENROUTER_MODEL="claude-sonnet-4-5"
fly secrets set OPENROUTER_BASE_URL="https://api.cometapi.com/v1"
```

### 4. Deploy
```bash
fly deploy
```

### 5. Check Status
```bash
fly status
fly logs
```

## Useful Commands

### View Logs (Real-time)
```bash
fly logs
```

### SSH into the machine
```bash
fly ssh console
```

### Scale Down (Stop bot)
```bash
fly scale count 0
```

### Scale Up (Start bot)
```bash
fly scale count 1
```

### Update App
```bash
fly deploy
```

## Free Tier Limits
- ✅ 3 shared-cpu-1x VMs with 256MB RAM
- ✅ 160GB outbound data transfer
- ✅ No credit card charge (just for verification)

## Troubleshooting

### If deployment fails:
```bash
fly doctor
```

### If bot doesn't respond:
```bash
fly logs --app bot-discord-ai
```

### Restart bot:
```bash
fly apps restart bot-discord-ai
```

## Notes
- Bot will run 24/7 on free tier
- Region set to Singapore (sin) for better latency
- Auto-restart enabled
- 256MB RAM should be enough for this bot
