const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { rateLimiter } = require('../utils/groqRateLimit');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Start a new chat (clears previous context)')
        .setDMPermission(false),
    async execute(interaction, provider, conversationHistory) {
        const channelId = interaction.channel?.id;
        if (!channelId) {
            await interaction.reply({ content: 'Could not determine channel ID.', ephemeral: true });
            return;
        }
        
        const existed = conversationHistory.has(channelId);
        conversationHistory.delete(channelId);
        
        // Force garbage collection if available
        if (global.gc) global.gc();
        
        // Show memory and rate limit stats
        const usage = process.memoryUsage();
        const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
        const stats = rateLimiter.getStats();
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(existed ? '✅ Chat Cleared' : '✅ New Chat Started')
            .setDescription(existed ? 'Previous conversation context has been cleared.' : 'Starting a new conversation.')
            .addFields(
                { 
                    name: '💾 Memory Usage', 
                    value: `${heapUsedMB}MB | Active conversations: ${conversationHistory.size}`, 
                    inline: false 
                },
                { 
                    name: '📊 Groq API Usage (Requests)', 
                    value: `Minute: ${stats.requestsPerMinute.current}/${stats.requestsPerMinute.limit} (${stats.requestsPerMinute.percentage}%)\nDay: ${stats.requestsPerDay.current}/${stats.requestsPerDay.limit} (${stats.requestsPerDay.percentage}%)`, 
                    inline: true 
                },
                { 
                    name: '🎯 Groq API Usage (Tokens)', 
                    value: `Minute: ${stats.tokensPerMinute.current.toLocaleString()}/${stats.tokensPerMinute.limit.toLocaleString()} (${stats.tokensPerMinute.percentage}%)\nDay: ${stats.tokensPerDay.current.toLocaleString()}/${stats.tokensPerDay.limit.toLocaleString()} (${stats.tokensPerDay.percentage}%)`, 
                    inline: true 
                }
            )
            .setFooter({ text: `Groq API - ${provider.model}` })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
}; 