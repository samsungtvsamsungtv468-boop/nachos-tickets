require('dotenv').config();

module.exports = {
  // Bot
  TOKEN: process.env.TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID,

  // Ticket system
  TICKET_CATEGORY_ID: process.env.TICKET_CATEGORY_ID || '1510971026232709160',
  STAFF_ROLE_ID: process.env.STAFF_ROLE_ID || '1497496326517031040',
  STAFF_USER_ID: process.env.STAFF_USER_ID || '1421835488808931441',
  LOGS_CHANNEL_ID: process.env.LOGS_CHANNEL_ID,

  // Theme colors (based on Nachos image — golden yellow + dark brown)
  COLORS: {
    PRIMARY: 0xF5A623,    // Golden yellow (main brand color)
    SECONDARY: 0x2C1A0E,  // Deep dark brown
    SUCCESS: 0x57C96C,    // Green for claimed/success
    DANGER: 0xE74C3C,     // Red for close/delete
    INFO: 0x5865F2,       // Discord blurple for Discord products
    CREAM: 0xFFF8DC,      // Cream for text highlights
  },

  // Ticket name map: subOption → channel prefix
  TICKET_NAMES: {
    'nitro':          'nitro',
    'boosts':         'boosts',
    'promo-links':    'promolinks',
    'blox-fruits':    'bloxfruits',
    'mm2':            'mm2',
    'adopt-me':       'adoptme',
    'netflix':        'netflix',
    'crunchyroll':    'crunchyroll',
    'spotify':        'spotify',
    'disney':         'disney',
  },

  // Category display labels for ticket embed
  TICKET_LABELS: {
    'nitro':          '🎁 Discord Nitro',
    'boosts':         '🚀 Server Boosts',
    'promo-links':    '🔗 Promo Links',
    'blox-fruits':    '🍎 Blox Fruits',
    'mm2':            '🗡️ Murder Mystery 2',
    'adopt-me':       '🐶 Adopt Me',
    'netflix':        '🎬 Netflix',
    'crunchyroll':    '🍥 Crunchyroll',
    'spotify':        '🎵 Spotify Premium',
    'disney':         '🏰 Disney+',
  },
};
