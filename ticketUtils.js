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
  LOGS_CHANNEL_ID,
  COLORS,
  TICKET_NAMES,
  TICKET_LABELS,
} = require('../config');
const fs = require('fs');
const path = require('path');

// In-memory store for open tickets { channelId: { userId, subOption, claimedBy } }
const openTickets = new Map();

/**
 * Creates a ticket channel for the given user and sub-option.
 */
async function createTicket(interaction, subOption) {
  const guild = interaction.guild;
  const user = interaction.user;

  // Check if user already has an open ticket for this type
  for (const [, data] of openTickets) {
    if (data.userId === user.id && data.subOption === subOption) {
      return interaction.reply({
        content: `❌ You already have an open **${TICKET_LABELS[subOption]}** ticket!`,
        ephemeral: true,
      });
    }
  }

  const prefix = TICKET_NAMES[subOption] || subOption;
  const channelName = `${prefix}-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  let channel;
  try {
    channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY_ID,
      permissionOverwrites: [
        {
          id: guild.id, // @everyone
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
    console.error('[Ticket] Error creating channel:', err);
    return interaction.reply({
      content: '❌ Failed to create ticket channel. Please contact an administrator.',
      ephemeral: true,
    });
  }

  // Register ticket
  openTickets.set(channel.id, { userId: user.id, subOption, claimedBy: null });

  // Acknowledge the interaction
  await interaction.reply({
    content: `✅ Your ticket has been created: ${channel}`,
    ephemeral: true,
  });

  // Send and auto-delete the ping message
  const pingMsg = await channel.send({
    content: `<@&${STAFF_ROLE_ID}> <@${STAFF_USER_ID}>`,
    allowedMentions: { roles: [STAFF_ROLE_ID], users: [STAFF_USER_ID] },
  });
  setTimeout(() => pingMsg.delete().catch(() => {}), 5000);

  // Build ticket embed
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

  // Ticket control buttons
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

  console.log(`[Ticket] Created: #${channelName} for ${user.tag} (${subOption})`);
}

/**
 * Claim a ticket.
 */
async function claimTicket(interaction, channelId) {
  const ticketData = openTickets.get(channelId);
  if (!ticketData) {
    return interaction.reply({ content: '❌ Ticket data not found.', ephemeral: true });
  }

  // Check if member has staff role
  if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
    return interaction.reply({ content: '❌ Only staff can claim tickets.', ephemeral: true });
  }

  if (ticketData.claimedBy) {
    return interaction.reply({
      content: `❌ This ticket is already claimed by <@${ticketData.claimedBy}>.`,
      ephemeral: true,
    });
  }

  ticketData.claimedBy = interaction.user.id;
  openTickets.set(channelId, ticketData);

  const claimEmbed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setDescription(`✅ Ticket claimed by ${interaction.user}`)
    .setTimestamp();

  await interaction.reply({ embeds: [claimEmbed] });
}

/**
 * Close a ticket — generate transcript and send to logs.
 */
async function closeTicket(interaction, channelId) {
  const ticketData = openTickets.get(channelId);
  if (!ticketData) {
    return interaction.reply({ content: '❌ Ticket data not found.', ephemeral: true });
  }

  // Staff or ticket owner can close
  const isStaff = interaction.member.roles.cache.has(STAFF_ROLE_ID);
  const isOwner = ticketData.userId === interaction.user.id;
  if (!isStaff && !isOwner) {
    return interaction.reply({ content: '❌ You cannot close this ticket.', ephemeral: true });
  }

  await interaction.reply({ content: '🔒 Closing ticket and generating transcript...' });

  const channel = interaction.channel;

  // Fetch messages for transcript
  const transcript = await generateTranscript(channel);

  // Send to logs channel
  if (LOGS_CHANNEL_ID) {
    try {
      const logsChannel = await interaction.guild.channels.fetch(LOGS_CHANNEL_ID);
      if (logsChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(COLORS.SECONDARY)
          .setTitle('📋 Ticket Transcript')
          .addFields(
            { name: 'Channel', value: channel.name, inline: true },
            { name: 'Category', value: TICKET_LABELS[ticketData.subOption] || ticketData.subOption, inline: true },
            { name: 'Opened By', value: `<@${ticketData.userId}>`, inline: true },
            {
              name: 'Claimed By',
              value: ticketData.claimedBy ? `<@${ticketData.claimedBy}>` : 'Unclaimed',
              inline: true,
            },
            { name: 'Closed By', value: `${interaction.user}`, inline: true }
          )
          .setFooter({ text: 'Nachos Marketplace' })
          .setTimestamp();

        // Write transcript to temp file
        const transcriptPath = path.join(__dirname, '../../data', `transcript-${channel.id}.txt`);
        fs.writeFileSync(transcriptPath, transcript, 'utf-8');

        await logsChannel.send({
          embeds: [logEmbed],
          files: [{ attachment: transcriptPath, name: `transcript-${channel.name}.txt` }],
        });

        // Clean up temp file
        fs.unlinkSync(transcriptPath);
      }
    } catch (err) {
      console.error('[Ticket] Error sending transcript:', err);
    }
  }

  openTickets.delete(channelId);

  // Delete channel after short delay
  setTimeout(() => channel.delete().catch(() => {}), 3000);
}

/**
 * Delete a ticket immediately (staff only).
 */
async function deleteTicket(interaction, channelId) {
  const isStaff = interaction.member.roles.cache.has(STAFF_ROLE_ID);
  if (!isStaff) {
    return interaction.reply({ content: '❌ Only staff can delete tickets.', ephemeral: true });
  }

  await interaction.reply({ content: '🗑️ Deleting ticket...' });
  openTickets.delete(channelId);
  setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
}

/**
 * Build a plain-text transcript from a channel's messages.
 */
async function generateTranscript(channel) {
  const lines = [`=== Nachos Marketplace Ticket Transcript ===`, `Channel: #${channel.name}`, `Generated: ${new Date().toUTCString()}`, ``, `--- Messages ---`, ``];

  let lastId;
  let fetched;
  const allMessages = [];

  do {
    fetched = await channel.messages.fetch({ limit: 100, before: lastId });
    allMessages.push(...fetched.values());
    lastId = fetched.last()?.id;
  } while (fetched.size === 100);

  // Sort oldest first
  allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  for (const msg of allMessages) {
    const time = new Date(msg.createdTimestamp).toUTCString();
    const author = `${msg.author.tag} (${msg.author.id})`;
    const content = msg.content || '[No text content]';
    const attachments = msg.attachments.size > 0 ? `\n  [Attachments: ${[...msg.attachments.values()].map(a => a.url).join(', ')}]` : '';
    lines.push(`[${time}] ${author}: ${content}${attachments}`);
  }

  return lines.join('\n');
}

module.exports = { createTicket, claimTicket, closeTicket, deleteTicket, openTickets };
