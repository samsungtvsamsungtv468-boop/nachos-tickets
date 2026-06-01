const { buildSubMenu } = require('../utils/panelBuilder');
const { createTicket, claimTicket, closeTicket, deleteTicket } = require('../utils/ticketUtils');

// Sub-menu custom IDs
const SUB_MENUS = ['sub_discord', 'sub_roblox', 'sub_streaming'];

// Ticket button prefixes
const BUTTON_PREFIXES = ['ticket_claim_', 'ticket_close_', 'ticket_delete_'];

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // ─── Slash Commands ────────────────────────────────────────────────
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
        return;
      }

      // ─── Main Category Select Menu ─────────────────────────────────────
      if (interaction.isStringSelectMenu() && interaction.customId === 'main_category') {
        const category = interaction.values[0];
        const result = buildSubMenu(category);
        if (!result) {
          return interaction.reply({ content: '❌ Unknown category.', ephemeral: true });
        }
        return interaction.reply({
          embeds: [result.embed],
          components: [result.row],
          ephemeral: true,
        });
      }

      // ─── Sub-category Select Menus ─────────────────────────────────────
      if (interaction.isStringSelectMenu() && SUB_MENUS.includes(interaction.customId)) {
        const subOption = interaction.values[0];
        // Defer so we can do async work
        await interaction.deferReply({ ephemeral: true });
        // Edit the deferred reply so createTicket's reply works properly
        // We pass the raw interaction; createTicket will use editReply
        await createTicketFromDeferred(interaction, subOption);
        return;
      }

      // ─── Ticket Buttons ────────────────────────────────────────────────
      if (interaction.isButton()) {
        const id = interaction.customId;

        if (id.startsWith('ticket_claim_')) {
          const channelId = id.replace('ticket_claim_', '');
          return await claimTicket(interaction, channelId);
        }

        if (id.startsWith('ticket_close_')) {
          const channelId = id.replace('ticket_close_', '');
          return await closeTicket(interaction, channelId);
        }

        if (id.startsWith('ticket_delete_')) {
          const channelId = id.replace('ticket_delete_', '');
          return await deleteTicket(interaction, channelId);
        }
      }
    } catch (error) {
      console.error('[Interaction] Unhandled error:', error);
      const msg = { content: '❌ An unexpected error occurred. Please try again.', ephemeral: true };
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(msg);
        } else {
          await interaction.reply(msg);
        }
      } catch (_) {
        // Swallow follow-up errors
      }
    }
  },
};

/**
 * Wraps createTicket for deferred interactions.
 * Since the interaction is already deferred, we need to handle the reply manually.
 */
async function createTicketFromDeferred(interaction, subOption) {
  const { openTickets } = require('../utils/ticketUtils');
  const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
  } = require('discord.js');
  const {
    TICKET_CATEGORY_ID,
    STAFF_ROLE_ID,
    STAFF_USER_ID,
    COLORS,
    TICKET_NAMES,
    TICKET_LABELS,
  } = require('../config');

  const guild = interaction.guild;
  const user = interaction.user;

  // Check for duplicate ticket
  for (const [, data] of openTickets) {
    if (data.userId === user.id && data.subOption === subOption) {
      return interaction.editReply({
        content: `❌ You already have an open **${TICKET_LABELS[subOption]}** ticket!`,
      });
    }
  }

  const prefix = TICKET_NAMES[subOption] || subOption;
  const channelName = `${prefix}-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)}`;

  let channel;
  try {
    channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY_ID,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
          ],
        },
        {
          id: STAFF_ROLE_ID,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.AttachFiles,
          ],
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageMessages,
          ],
        },
      ],
    });
  } catch (err) {
    console.error('[Ticket] Channel creation error:', err);
    return interaction.editReply({
      content: '❌ Failed to create ticket channel. Please contact an administrator.',
    });
  }

  openTickets.set(channel.id, { userId: user.id, subOption, claimedBy: null });

  await interaction.editReply({ content: `✅ Your ticket has been created: ${channel}` });

  // Ping staff and auto-delete after 5s
  const pingMsg = await channel.send({
    content: `<@&${STAFF_ROLE_ID}> <@${STAFF_USER_ID}>`,
    allowedMentions: { roles: [STAFF_ROLE_ID], users: [STAFF_USER_ID] },
  });
  setTimeout(() => pingMsg.delete().catch(() => {}), 5000);

  // Ticket embed
  const ticketEmbed = new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle('🎫 Purchase Ticket')
    .setDescription(
      [
        '**Welcome to Nachos Marketplace.**',
        '',
        'Thank you for opening a purchase ticket.',
        'A reseller will assist you shortly.',
        '',
        'Please provide:',
        '',
        '• Product you wish to purchase',
        '• Quantity',
        '• Additional information',
        '',
        '━━━━━━━━━━━━━━',
        '',
        '💰 **Payment Method**',
        'Litecoin (LTC)',
        '',
        '⏳ Please wait patiently for a reseller to respond.',
        '',
        '━━━━━━━━━━━━━━',
      ].join('\n')
    )
    .addFields(
      { name: '👤 Opened By', value: `${user} (${user.tag})`, inline: true },
      { name: '🛒 Category', value: TICKET_LABELS[subOption] || subOption, inline: true }
    )
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: 'Nachos Marketplace' })
    .setTimestamp();

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ticket_claim_${channel.id}`)
      .setLabel('Claim Ticket')
      .setEmoji('🙋')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`ticket_close_${channel.id}`)
      .setLabel('Close Ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`ticket_delete_${channel.id}`)
      .setLabel('Delete Ticket')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({ embeds: [ticketEmbed], components: [buttons] });
  console.log(`[Ticket] ✅ Created #${channelName} for ${user.tag} | Type: ${subOption}`);
}
