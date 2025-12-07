const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();
const { logMemoryUsage, startMemoryMonitoring } = require('./utils/memoryMonitor');

// Keep-alive server for Replit/UptimeRobot (prevents bot from sleeping)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        status: 'Bot is running! 🤖',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        bot: client.isReady() ? 'online' : 'offline',
        uptime: process.uptime()
    });
});

app.listen(PORT, () => {
    console.log(`✅ Keep-alive server running on port ${PORT}`);
});

// Optimized client for low memory (500MB)
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    sweepers: {
        messages: {
            interval: 300, // 5 minutes
            lifetime: 180, // Keep messages for 3 minutes
        },
        users: {
            interval: 3600, // 1 hour
            filter: () => user => user.bot && user.id !== client.user.id,
        },
    },
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

const BOT_TOKEN = process.env.BOT_TOKEN;

// Groq API Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
const GROQ_BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';

// Validate environment variables
if (!BOT_TOKEN) {
    console.error('❌ ERROR: BOT_TOKEN is not set in environment variables!');
    process.exit(1);
}

if (!GROQ_API_KEY) {
    console.error('❌ ERROR: GROQ_API_KEY is not set in environment variables!');
    console.error('Please set GROQ_API_KEY in your .env file or hosting platform dashboard.');
    console.error('Get your free API key at: https://console.groq.com/keys');
    process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log(`📦 GROQ_MODEL: ${GROQ_MODEL}`);

// In-memory conversation history (optimized for 500MB RAM)
const conversationHistory = new Map();
const modelPreferences = new Map(); // Store model preference per channel
const MAX_CONVERSATIONS = 50; // Limit total conversations
const CONVERSATION_EXPIRY = 30 * 60 * 1000; // 30 minutes

// Import CHAT_MODELS for dynamic model selection
const { CHAT_MODELS } = require('./commands/model');

// Auto-cleanup old conversations every 10 minutes
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [channelId, data] of conversationHistory.entries()) {
        if (now - data.lastActivity > CONVERSATION_EXPIRY) {
            conversationHistory.delete(channelId);
            cleaned++;
        }
    }
    if (cleaned > 0) {
        console.log(`🧹 Cleaned ${cleaned} expired conversations. Active: ${conversationHistory.size}`);
        if (global.gc) global.gc(); // Force garbage collection if available
    }
}, 10 * 60 * 1000);

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`🚀 Using Groq API - Ultra-fast AI responses with LLaMA 4 Scout!`);
    console.log(`💾 Memory optimized for 500MB RAM hosting`);
    console.log(`Model: ${GROQ_MODEL}`);
    console.log(`📊 Rate Limits: 30 RPM, 1K RPD, 12K TPM, 100K TPD`);
    client.user.setPresence({
        activities: [
            { name: '/ask atau /model', type: ActivityType.Playing },
        ],
        status: 'online',
    });
    
    // Start memory monitoring
    logMemoryUsage('Bot Ready');
    startMemoryMonitoring(15); // Check every 15 minutes
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    // Memory limit check - prevent overload
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    if (heapUsedMB > 450) { // 450MB threshold for 500MB limit
        console.warn(`⚠️ High memory usage: ${Math.round(heapUsedMB)}MB`);
        // Force cleanup
        const oldSize = conversationHistory.size;
        if (oldSize > 20) {
            const keys = Array.from(conversationHistory.keys());
            const toDelete = keys.slice(0, Math.floor(oldSize / 2));
            toDelete.forEach(k => conversationHistory.delete(k));
            console.log(`🧹 Emergency cleanup: removed ${toDelete.length} conversations`);
        }
        if (global.gc) global.gc();
        
        await interaction.reply({ 
            content: '⚠️ Bot is running low on memory. Please try again in a moment.', 
            ephemeral: true 
        });
        return;
    }

    try {
        // Get dynamic model based on channel preference
        const channelId = interaction.channel?.id;
        const modelKey = modelPreferences.get(channelId) || 'llama-4-scout';
        const modelConfig = CHAT_MODELS[modelKey] || CHAT_MODELS['llama-4-scout'];
        const activeModel = modelConfig.id;

        await command.execute(
            interaction,
            { apiKey: GROQ_API_KEY, model: activeModel, baseUrl: GROQ_BASE_URL },
            conversationHistory,
            modelPreferences
        );
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});



// Graceful shutdown handler
const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    client.destroy();
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

client.login(BOT_TOKEN);