# Wispbyte Environment Variables Setup

## 🚨 Important: Setting Environment Variables on Wispbyte

The `.env` file in your local project **may not** be uploaded to Wispbyte. You need to set environment variables in the Wispbyte dashboard.

## 📝 How to Set Environment Variables on Wispbyte

### Method 1: Wispbyte Dashboard (Recommended)

1. Go to your Wispbyte dashboard
2. Select your bot server
3. Click on **"Startup"** or **"Variables"** tab
4. Add the following environment variables:

| Variable Name | Value | Example |
|---------------|-------|---------|
| `BOT_TOKEN` | Your Discord bot token | `MTI4Nzc3MjgxODk2NDIyMTk1Mg.GAiP68.MG4I...` |
| `CLIENT_ID` | Your Discord client ID | `1287772818964221952` |
| `GROQ_API_KEY` | Your Groq API key | `gsk_5BSnjOAaFWFdvenDdAMMWGdyb3FY...` |
| `GROQ_MODEL` | Model name | `llama-3.3-70b-versatile` |
| `GROQ_BASE_URL` | API endpoint | `https://api.groq.com/openai/v1` |

5. Save and restart your server

### Method 2: .wispbyte File

Edit the `.wispbyte` file in your project:

```ini
# Wispbyte Configuration File
# For Discord Bot deployment on free hosting

# Startup Command
startup=bash start.sh

# Port (if needed)
port=3000

# Environment Variables
[environment]
BOT_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

### Method 3: Upload .env File

Some hosting platforms allow uploading `.env` files:

1. Make sure `.env` is **NOT** in `.gitignore` (only for deployment)
2. Or manually create `.env` file on the server via File Manager
3. Add all required variables

## 🔑 Getting Your Keys

### Discord Bot Token
1. Visit: https://discord.com/developers/applications
2. Select your application
3. Go to "Bot" section
4. Click "Reset Token" and copy it
5. **Never share this token!**

### Groq API Key (FREE!)
1. Visit: https://console.groq.com/keys
2. Sign up (no credit card needed)
3. Click "Create API Key"
4. Copy the key (starts with `gsk_`)
5. **Keep it secret!**

## ✅ Verifying Environment Variables

After setting the variables, your bot should show on startup:

```
✅ Environment variables loaded successfully
🔑 GROQ_API_KEY: gsk_5BSnjO...3NqP
📦 GROQ_MODEL: llama-3.3-70b-versatile
🌐 GROQ_BASE_URL: https://api.groq.com/openai/v1
```

## 🚨 Common Issues

### Error: "GROQ_API_KEY is not set"
**Solution:** Environment variable not loaded. Check:
1. Variable is set in Wispbyte dashboard
2. Variable name is exactly `GROQ_API_KEY` (case-sensitive)
3. Server was restarted after adding variables

### Error: "Authorization: Bearer undefined"
**Solution:** API key is not being read. Check:
1. `.env` file exists and has correct format
2. No spaces around `=` sign
3. No quotes around values (unless needed)

Example correct format:
```env
GROQ_API_KEY=gsk_your_key_here
```

Example incorrect format:
```env
GROQ_API_KEY = "gsk_your_key_here"
```

### Error: "401 Unauthorized"
**Solution:** API key is invalid or expired. Check:
1. Key is correct (copy-paste carefully)
2. Key hasn't been revoked
3. Create a new key at https://console.groq.com/keys

## 📋 Current Configuration

Your `.env` file should contain:

```env
# Discord Bot Configuration
BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
CLIENT_ID=YOUR_DISCORD_CLIENT_ID_HERE

# Groq API Configuration
GROQ_API_KEY=gsk_YOUR_GROQ_API_KEY_HERE
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

**⚠️ Warning:** Replace these placeholders with YOUR ACTUAL keys from Discord and Groq!

## 🔄 After Setting Variables

1. Save all changes
2. **Restart your Wispbyte server**
3. Check logs for:
   ```
   ✅ Environment variables loaded successfully
   ```
4. Test with `/ask` command

## 🆘 Still Not Working?

### Option 1: Hardcode (NOT RECOMMENDED for production)

For testing only, you can temporarily hardcode the key in `index.js`:

```javascript
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'gsk_your_actual_key_here';
```

**⚠️ Remove this before pushing to GitHub!**

### Option 2: Check File Permissions

Make sure `.env` file has correct permissions:
```bash
chmod 600 .env
```

### Option 3: Use Alternative Hosting

If Wispbyte doesn't support environment variables well, consider:
- **Replit**: Supports secrets manager
- **Railway**: Native environment variable support
- **Fly.io**: Good `.env` support
- **Render**: Easy environment variable setup

## 📚 Additional Resources

- [Wispbyte Documentation](https://wispbyte.com/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Discord.js Guide](https://discordjs.guide/)

---

**Last Updated:** October 2025  
**For:** Wispbyte Hosting  
**Status:** Configuration Guide
