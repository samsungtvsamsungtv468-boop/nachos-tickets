const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { buildMainEmbed, buildMainMenu } = require('../utils/panelBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Send the Nachos Marketplace ticket panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    // Delete the slash command invocation (stay clean)
    await interaction.deferReply({ ephemeral: true });

    try {
      const embed = buildMainEmbed();
      const row = buildMainMenu();

      await interaction.channel.send({ embeds: [embed], components: [row] });
      await interaction.editReply({ content: '✅ Panel sent successfully!' });
    } catch (error) {
      console.error('[Panel] Error sending panel:', error);
      await interaction.editReply({ content: '❌ Failed to send panel. Check bot permissions.' });
    }
  },
};
