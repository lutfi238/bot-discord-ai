const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, ActivityType, Partials } = require('discord.js');
const axios = require('axios');
require('dotenv').config();
const { formatForDiscord, splitMessagePreservingCodeBlocks } = require('./utils/formatting');
const { SYSTEM_PROMPT } = require('./utils/prompt');
const { callChatCompletion } = require('./utils/api');
const { createWarningEmbed, createErrorEmbed } = require('./utils/embeds');
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

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
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

// Comet API Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'claude-sonnet-4-5';
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://api.cometapi.com/v1';

// In-memory conversation history (optimized for hosting)
const conversationHistory = new Map();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`🚀 Using Claude Sonnet 4.5 via Comet API - Advanced AI responses!`);
    console.log(`Model: ${OPENROUTER_MODEL}`);
    client.user.setPresence({
        activities: [
            { name: '/ask with Claude Sonnet 4.5', type: ActivityType.Playing },
        ],
        status: 'online',
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(
            interaction,
            { apiKey: OPENROUTER_API_KEY, model: OPENROUTER_MODEL, baseUrl: OPENROUTER_BASE_URL },
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