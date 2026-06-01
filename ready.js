const { deployCommands } = require('../handlers/commandHandler');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[Bot] ✅ Logged in as ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: '🌮 Nachos Marketplace', type: 3 }], // Watching
      status: 'online',
    });
    // Auto-deploy commands on startup
    await deployCommands(client);
  },
};
