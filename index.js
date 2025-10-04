const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();

// Optional memory monitoring (fallback if file doesn't exist)
let logMemoryUsage, startMemoryMonitoring;
try {
    const memoryMonitor = require('./utils/memoryMonitor');
    logMemoryUsage = memoryMonitor.logMemoryUsage;
    startMemoryMonitoring = memoryMonitor.startMemoryMonitoring;
} catch (e) {
    // Fallback implementations if memoryMonitor doesn't exist
    logMemoryUsage = (label) => {
        const usage = process.memoryUsage();
        const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
        const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
        const rssMB = Math.round(usage.rss / 1024 / 1024);
        console.log(`📊 ${label}: Heap ${heapUsedMB}/${heapTotalMB}MB | RSS ${rssMB}MB`);
    };
    startMemoryMonitoring = () => {
        setInterval(() => {
            logMemoryUsage('Periodic Check');
            if (global.gc) global.gc();
        }, 15 * 60 * 1000);
    };
}
// Database utilities removed for hosting compatibility

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
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';

// In-memory conversation history (optimized for 500MB RAM)
const conversationHistory = new Map();
const MAX_CONVERSATIONS = 50; // Limit total conversations
const CONVERSATION_EXPIRY = 30 * 60 * 1000; // 30 minutes

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
    console.log(`🚀 Using Groq API - Ultra-fast AI responses with LLaMA 3.3 70B!`);
    console.log(`💾 Memory optimized for 500MB RAM hosting`);
    console.log(`Model: ${GROQ_MODEL}`);
    console.log(`📊 Rate Limits: 30 RPM, 1K RPD, 12K TPM, 100K TPD`);
    client.user.setPresence({
        activities: [
            { name: '/ask with llama-3.3-70b-versatile', type: ActivityType.Playing },
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
        await command.execute(
            interaction,
            { apiKey: GROQ_API_KEY, model: GROQ_MODEL, baseUrl: GROQ_BASE_URL },
            conversationHistory
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



client.login(BOT_TOKEN);