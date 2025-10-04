const { SlashCommandBuilder } = require('discord.js');
// Database utilities removed for hosting compatibility

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Start a new chat (clears previous context)')
        .setDMPermission(true),
    async execute(interaction, _provider, conversationHistory) {
        const channelId = interaction.channel?.id || interaction.user.id;
        const existed = conversationHistory.has(channelId);
        conversationHistory.delete(channelId);
        // Note: Using in-memory storage for hosting compatibility
        await interaction.reply({
            content: existed ? 'New chat started. Previous context cleared.' : 'New chat started.',
            ephemeral: interaction.inGuild(),
        });
    },
}; 