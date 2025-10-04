const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { formatForDiscord, splitMessagePreservingCodeBlocks } = require('../utils/formatting');
const { SYSTEM_PROMPT } = require('../utils/prompt');
const { callChatCompletion, callChatCompletionStream } = require('../utils/api');
const { createWarningEmbed, createErrorEmbed } = require('../utils/embeds');
const { rateLimiter } = require('../utils/groqRateLimit');
// Database utilities removed for hosting compatibility

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask the AI a question')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question you want to ask')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('stream')
                .setDescription('Stream the response in realtime')
                .setRequired(false)
        ),
    async execute(interaction, provider, conversationHistory) {
        // Check if command is used in a server
        if (!interaction.inGuild()) {
            await interaction.reply({ 
                content: '❌ This command can only be used in a server, not in DMs.', 
                ephemeral: true 
            });
            return;
        }

        await interaction.deferReply();
        const question = interaction.options.getString('question');
        const useStream = interaction.options.getBoolean('stream') ?? true;

        try {
            const channelId = interaction.channel.id;
            
            // Get or create conversation data with timestamp
            let conversationData = conversationHistory.get(channelId);
            if (!conversationData) {
                conversationData = { history: [], lastActivity: Date.now() };
                conversationHistory.set(channelId, conversationData);
            } else {
                conversationData.lastActivity = Date.now();
            }
            
            const history = conversationData.history;

            // Convert stored history (assistant/user) into OpenAI/OpenRouter format
            const messages = history.map(m => ({ role: m.role, content: m.content }))
                .concat([{ role: 'user', content: question }]);

            // Rate limit handler
            const onRateLimit = async (rateLimitInfo) => {
                const message = rateLimiter.getRateLimitMessage(rateLimitInfo);
                const embed = new EmbedBuilder()
                    .setColor(0xFF9900)
                    .setTitle('⏱️ Groq API Rate Limit Reached')
                    .setDescription(message)
                    .setFooter({ text: 'Groq API Free Tier Limits' })
                    .setTimestamp();
                
                try {
                    await interaction.editReply({ embeds: [embed] });
                } catch (_) { /* ignore */ }
            };

            let raw;
            if (useStream) {
                // Streaming mode: incrementally edit the reply
                let buffer = '';
                let lastEdit = 0;
                const throttleMs = 400;
                await callChatCompletionStream({
                    baseUrl: provider.baseUrl,
                    apiKey: provider.apiKey,
                    model: provider.model,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...messages,
                    ],
                    timeoutMs: 60000,
                    onDelta: async (delta) => {
                        buffer += delta;
                        const now = Date.now();
                        if (buffer.length <= 1900 && (now - lastEdit > throttleMs || delta.includes('\n'))) {
                            lastEdit = now;
                            try {
                                await interaction.editReply(formatForDiscord(buffer));
                            } catch (_) { /* ignore */ }
                        }
                    },
                    onRateLimit,
                }).then((full) => { raw = full; });
            } else {
                // Non-streaming mode
                let warned = false;
                raw = await callChatCompletion({
                    baseUrl: provider.baseUrl,
                    apiKey: provider.apiKey,
                    model: provider.model,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...messages,
                    ],
                    timeoutMs: 60000,
                    maxRetries: 3,
                    onRetry: async (attempt) => {
                        if (warned) return;
                        warned = true;
                        const embed = createWarningEmbed(
                            `The AI service is busy (retrying, attempt ${attempt + 1}). This may take a few seconds...`,
                            { title: 'Please wait' }
                        );
                        try {
                            await interaction.followUp({ embeds: [embed], ephemeral: true });
                        } catch (_) { /* ignore */ }
                    },
                    onGiveUp: async () => {
                        if (!interaction.replied && !interaction.deferred) return;
                        const embed = createErrorEmbed('Failed to get a response from the AI service. Please try again later.', { title: 'Service Unavailable' });
                        try {
                            await interaction.followUp({ embeds: [embed], ephemeral: true });
                        } catch (_) { /* ignore */ }
                    },
                    onRateLimit,
                });
            }
            const formatted = formatForDiscord(raw);

            // Truncate long responses to save memory
            const truncatedRaw = raw.length > 4000 ? raw.substring(0, 4000) + '...' : raw;
            const truncatedQuestion = question.length > 1000 ? question.substring(0, 1000) + '...' : question;
            
            history.push({ role: 'user', content: truncatedQuestion });
            history.push({ role: 'assistant', content: truncatedRaw });

            // Aggressive memory limits for 500MB hosting
            const MAX_MESSAGES = 6; // Reduced from 20 to 6 (3 exchanges)
            conversationData.history = history.slice(-MAX_MESSAGES);
            conversationData.lastActivity = Date.now();
            
            // Limit total conversations stored
            if (conversationHistory.size > 50) {
                // Remove oldest conversations
                const entries = Array.from(conversationHistory.entries());
                entries.sort((a, b) => a[1].lastActivity - b[1].lastActivity);
                const toRemove = entries.slice(0, 25); // Remove half
                toRemove.forEach(([id]) => conversationHistory.delete(id));
                console.log(`🧹 Auto-cleanup: removed 25 old conversations`);
            }

            const chunks = splitMessagePreservingCodeBlocks(formatted, 1990);

            // First chunk edits the reply, rest are followups
            await interaction.editReply(chunks[0]);
            for (let i = 1; i < chunks.length; i += 1) {
                // eslint-disable-next-line no-await-in-loop
                await interaction.followUp(chunks[i]);
            }
        } catch (error) {
            console.error('Error calling Groq API:', error?.response?.data || error.message);
            
            // Handle rate limit errors specifically
            if (error.rateLimitInfo) {
                const message = rateLimiter.getRateLimitMessage(error.rateLimitInfo);
                const embed = new EmbedBuilder()
                    .setColor(0xFF9900)
                    .setTitle('⏱️ Groq API Rate Limit Reached')
                    .setDescription(message)
                    .setFooter({ text: 'Groq API Free Tier Limits' })
                    .setTimestamp();
                
                try {
                    await interaction.editReply({ embeds: [embed] });
                } catch (_) { /* ignore */ }
                return;
            }
            
            await interaction.editReply('Sorry, I encountered an error trying to get a response.');
        }
    },
}; 