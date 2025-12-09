const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { rateLimiter } = require('../utils/rateLimit');

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
        
        // Show memory stats
        const usage = process.memoryUsage();
        const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
        
        // Get user's rate limit stats
        const userId = interaction.user.id;
        const stats = rateLimiter.getStats(userId);
        
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
                    name: '📊 Your Usage (Anti-spam)', 
                    value: `Minute: ${stats.minute.current}/${stats.minute.limit} (${stats.minute.percentage}%)\\nHour: ${stats.hour.current}/${stats.hour.limit} (${stats.hour.percentage}%)`, 
                    inline: true 
                },
                { 
                    name: '✨ Model', 
                    value: `Gemini 3 Pro Preview via Algion API (FREE!)`, 
                    inline: true 
                }
            )
            .setFooter({ text: `Algion API - ${provider.model}` })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    },
}; 