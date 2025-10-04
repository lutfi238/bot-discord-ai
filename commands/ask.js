const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { formatForDiscord, splitMessagePreservingCodeBlocks } = require('../utils/formatting');
const { SYSTEM_PROMPT } = require('../utils/prompt');
const { callChatCompletion, callChatCompletionStream } = require('../utils/api');
const { createWarningEmbed, createErrorEmbed } = require('../utils/embeds');
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
            const history = conversationHistory.get(channelId) || [];

            // Convert stored history (assistant/user) into OpenAI/OpenRouter format
            const messages = history.map(m => ({ role: m.role, content: m.content }))
                .concat([{ role: 'user', content: question }]);

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
                    }
                });
            }
            const formatted = formatForDiscord(raw);

            history.push({ role: 'user', content: question });
            // Store raw text in history to avoid compounding formatting transforms
            history.push({ role: 'assistant', content: raw });

            // Cap history to last 20 messages to avoid unbounded growth
            const MAX_MESSAGES = 20;
            const trimmed = history.slice(-MAX_MESSAGES);
            conversationHistory.set(channelId, trimmed);
            // Note: Using in-memory storage for hosting compatibility

            const chunks = splitMessagePreservingCodeBlocks(formatted, 1990);

            // First chunk edits the reply, rest are followups
            await interaction.editReply(chunks[0]);
            for (let i = 1; i < chunks.length; i += 1) {
                // eslint-disable-next-line no-await-in-loop
                await interaction.followUp(chunks[i]);
            }
        } catch (error) {
            console.error('Error calling OpenRouter API:', error?.response?.data || error.message);
            await interaction.editReply('Sorry, I encountered an error trying to get a response.');
        }
    },
}; 