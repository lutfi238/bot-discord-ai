// Vercel serverless function wrapper
const { Client, Collection, GatewayIntentBits, ActivityType, Partials } = require('discord.js');

let client = null;

async function initializeBot() {
  if (client && client.isReady()) {
    return client;
  }

  const fs = require('fs');
  const path = require('path');
  const { formatForDiscord, splitMessagePreservingCodeBlocks } = require('../utils/formatting');
  const { SYSTEM_PROMPT } = require('../utils/prompt');
  const { callChatCompletion } = require('../utils/api');
  const { createWarningEmbed, createErrorEmbed } = require('../utils/embeds');

  client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel],
  });

  client.commands = new Collection();
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
  }

  const conversationHistory = new Map();

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      const provider = {
        apiKey: process.env.OPENROUTER_API_KEY,
        model: process.env.OPENROUTER_MODEL || 'claude-sonnet-4-5',
        baseUrl: process.env.OPENROUTER_BASE_URL || 'https://api.cometapi.com/v1',
      };
      await command.execute(interaction, provider, conversationHistory);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);
    }
  });

  await client.login(process.env.BOT_TOKEN);
  
  return client;
}

module.exports = async (req, res) => {
  try {
    await initializeBot();
    res.status(200).json({ 
      status: 'Bot is running',
      uptime: process.uptime(),
      ready: client?.isReady() || false
    });
  } catch (error) {
    console.error('Error initializing bot:', error);
    res.status(500).json({ error: 'Failed to initialize bot' });
  }
};
