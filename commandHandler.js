const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { TOKEN, CLIENT_ID, GUILD_ID } = require('../config');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(`[Commands] Loaded: ${command.data.name}`);
    }
  }
}

async function deployCommands(client) {
  const commands = [];
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data) commands.push(command.data.toJSON());
  }

  const rest = new REST().setToken(TOKEN);
  try {
    console.log('[Deploy] Deploying slash commands...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log(`[Deploy] Successfully deployed ${commands.length} command(s).`);
  } catch (error) {
    console.error('[Deploy] Error deploying commands:', error);
  }
}

module.exports = { loadCommands, deployCommands };
