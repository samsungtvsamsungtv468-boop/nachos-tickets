const {
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require('discord.js');
const { COLORS } = require('../config');

/**
 * Builds the main Nachos Marketplace panel embed.
 */
function buildMainEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle('🌮 Nachos Marketplace')
    .setDescription(
      [
        'Welcome to **Nachos Marketplace**.',
        '',
        'We provide Discord products, Roblox items, and premium streaming services.',
        '',
        'Select a category below to continue.',
        '',
        '━━━━━━━━━━━━━━',
        '',
        '💙 Discord Products',
        '🎮 Roblox Marketplace',
        '📺 Streaming Services',
        '',
        '━━━━━━━━━━━━━━',
        '',
        '💰 **Payment Method**',
        '• Litecoin (LTC)',
        '',
        '⚡ Fast delivery',
        '🛡️ Trusted resellers',
        '🎫 Open a ticket to get started',
      ].join('\n')
    )
    .setFooter({ text: 'Nachos Marketplace • Premium Digital Services' })
    .setTimestamp();
}

/**
 * Builds the main category select menu.
 */
function buildMainMenu() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('main_category')
    .setPlaceholder('📂 Select a category...')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Discord Products')
        .setDescription('Nitro, Server Boosts, Promo Links')
        .setEmoji('💙')
        .setValue('discord'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Roblox Marketplace')
        .setDescription('Blox Fruits, MM2, Adopt Me')
        .setEmoji('🎮')
        .setValue('roblox'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Streaming Services')
        .setDescription('Netflix, Crunchyroll, Spotify, Disney+')
        .setEmoji('📺')
        .setValue('streaming')
    );

  return new ActionRowBuilder().addComponents(menu);
}

/**
 * Returns the sub-menu and embed for a given main category.
 */
function buildSubMenu(category) {
  let embed, menu;

  switch (category) {
    case 'discord':
      embed = new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle('💙 Discord Products')
        .setDescription('Select the Discord product you wish to purchase.')
        .setFooter({ text: 'Nachos Marketplace' });

      menu = new StringSelectMenuBuilder()
        .setCustomId('sub_discord')
        .setPlaceholder('🛒 Select a product...')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Nitro')
            .setDescription('Discord Nitro subscription')
            .setEmoji('🎁')
            .setValue('nitro'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Server Boosts')
            .setDescription('Discord Server Boosts')
            .setEmoji('🚀')
            .setValue('boosts'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Promo Links')
            .setDescription('Discord promotional links')
            .setEmoji('🔗')
            .setValue('promo-links')
        );
      break;

    case 'roblox':
      embed = new EmbedBuilder()
        .setColor(COLORS.PRIMARY)
        .setTitle('🎮 Roblox Marketplace')
        .setDescription('Select the Roblox item you wish to purchase.')
        .setFooter({ text: 'Nachos Marketplace' });

      menu = new StringSelectMenuBuilder()
        .setCustomId('sub_roblox')
        .setPlaceholder('🛒 Select a game item...')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Blox Fruits')
            .setDescription('Blox Fruits items and currency')
            .setEmoji('🍎')
            .setValue('blox-fruits'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Murder Mystery 2')
            .setDescription('MM2 knives, guns, and pets')
            .setEmoji('🗡️')
            .setValue('mm2'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Adopt Me')
            .setDescription('Adopt Me pets and items')
            .setEmoji('🐶')
            .setValue('adopt-me')
        );
      break;

    case 'streaming':
      embed = new EmbedBuilder()
        .setColor(COLORS.DANGER)
        .setTitle('📺 Streaming Services')
        .setDescription('Select the streaming service you wish to purchase.')
        .setFooter({ text: 'Nachos Marketplace' });

      menu = new StringSelectMenuBuilder()
        .setCustomId('sub_streaming')
        .setPlaceholder('🛒 Select a service...')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Netflix')
            .setDescription('Netflix subscription')
            .setEmoji('🎬')
            .setValue('netflix'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Crunchyroll')
            .setDescription('Crunchyroll premium subscription')
            .setEmoji('🍥')
            .setValue('crunchyroll'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Spotify Premium')
            .setDescription('Spotify Premium subscription')
            .setEmoji('🎵')
            .setValue('spotify'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Disney+')
            .setDescription('Disney+ subscription')
            .setEmoji('🏰')
            .setValue('disney')
        );
      break;

    default:
      return null;
  }

  return { embed, row: new ActionRowBuilder().addComponents(menu) };
}

module.exports = { buildMainEmbed, buildMainMenu, buildSubMenu };
