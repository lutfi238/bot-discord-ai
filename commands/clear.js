const { SlashCommandBuilder } = require('discord.js');
// Database utilities removed for hosting compatibility

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Start a new chat (clears previous context)')
        .setDMPermission(false),
    async execute(interaction, _provider, conversationHistory) {
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
        
        await interaction.reply({
            content: existed 
                ? `✅ New chat started. Previous context cleared.\n💾 Memory: ${heapUsedMB}MB | Active conversations: ${conversationHistory.size}` 
                : `✅ New chat started.\n💾 Memory: ${heapUsedMB}MB | Active conversations: ${conversationHistory.size}`,
            ephemeral: true,
        });
    },
}; 