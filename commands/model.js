const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Available models from Groq API
const CHAT_MODELS = {
    'llama-4-scout': {
        id: 'meta-llama/llama-4-scout-17b-16e-instruct',
        name: 'LLaMA 4 Scout',
        description: 'Paling Sat-set. Cepat, irit, cocok buat ngobrol santai.',
        emoji: '⚡'
    },
    'llama-3.3-70b': {
        id: 'llama-3.3-70b-versatile',
        name: 'LLaMA 3.3 70B',
        description: 'Paling Pintar. Bagus untuk mikir keras atau cerita panjang.',
        emoji: '🧠'
    },
    'qwen-2.5-32b': {
        id: 'qwen-2.5-32b',
        name: 'Qwen 2.5 32B',
        description: 'Jago coding dan logika matematika.',
        emoji: '💻'
    },
    'qwen-3-32b': {
        id: 'qwen/qwen3-32b',
        name: 'Qwen 3 32B',
        description: 'Versi terbaru Qwen, lebih pintar.',
        emoji: '🚀'
    },
    'gemma-2-9b': {
        id: 'gemma2-9b-it',
        name: 'Gemma 2 9B (Google)',
        description: 'Ringan dan sopan dari Google.',
        emoji: '🌸'
    },
    'mixtral-8x7b': {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        description: 'Model klasik dengan context panjang 32K.',
        emoji: '📚'
    }
};

const MODEL_CHOICES = Object.entries(CHAT_MODELS).map(([key, value]) => ({
    name: `${value.emoji} ${value.name}`,
    value: key
}));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('model')
        .setDescription('Pilih model AI untuk channel ini')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('pilihan')
                .setDescription('Model AI yang ingin digunakan')
                .setRequired(false)
                .addChoices(...MODEL_CHOICES)
        ),
    CHAT_MODELS,
    async execute(interaction, provider, conversationHistory, modelPreferences) {
        const selectedModel = interaction.options.getString('pilihan');
        const channelId = interaction.channel.id;

        // If no model selected, show current model and list
        if (!selectedModel) {
            const currentPref = modelPreferences?.get(channelId);
            const currentKey = currentPref || 'llama-4-scout';
            const currentModel = CHAT_MODELS[currentKey] || CHAT_MODELS['llama-4-scout'];

            const modelList = Object.entries(CHAT_MODELS)
                .map(([key, m]) => {
                    const isCurrent = key === currentKey;
                    return `${m.emoji} **${m.name}**${isCurrent ? ' ✅' : ''}\n└ ${m.description}`;
                })
                .join('\n\n');

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('🤖 Model AI Tersedia')
                .setDescription(`**Model aktif:** ${currentModel.emoji} ${currentModel.name}\n\n${modelList}`)
                .setFooter({ text: 'Gunakan /model pilihan:<model> untuk mengganti' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        // Set new model
        const newModel = CHAT_MODELS[selectedModel];
        if (!newModel) {
            await interaction.reply({ content: '❌ Model tidak valid.', ephemeral: true });
            return;
        }

        // Save preference
        if (modelPreferences) {
            modelPreferences.set(channelId, selectedModel);
        }

        // Clear conversation history for this channel (new model = fresh start)
        if (conversationHistory?.has(channelId)) {
            conversationHistory.delete(channelId);
        }

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✅ Model Diubah')
            .setDescription(`${newModel.emoji} **${newModel.name}**\n${newModel.description}`)
            .addFields(
                { name: 'Model ID', value: `\`${newModel.id}\``, inline: true },
                { name: 'Channel', value: `<#${channelId}>`, inline: true }
            )
            .setFooter({ text: 'Conversation history telah direset' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
