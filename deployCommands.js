// Run with: node src/handlers/deployCommands.js
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { TOKEN, CLIENT_ID, GUILD_ID } = require('../config');

const commands = [];
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) commands.push(command.data.toJSON());
}

const rest = new REST().setToken(TOKEN);

(async () => {
  try {
    console.log(`[Deploy] Deploying ${commands.length} slash command(s) to guild ${GUILD_ID}...`);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('[Deploy] ✅ Commands deployed successfully!');
  } catch (error) {
    console.error('[Deploy] ❌ Error:', error);
  }
})();
