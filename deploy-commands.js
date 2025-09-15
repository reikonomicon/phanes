const { REST, Routes } = require('discord.js');
require('dotenv').config();

const token = process.env.token;
const clientId = process.env.clientId;
const guildId = process.env.guildId;

const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

console.log('Folders found:', commandFolders);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	console.log(`In folder ${folder}, found files:`, commandFiles);

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		console.log(`Loading command file: ${filePath}`);
		const command = require(filePath);
		console.log('Loaded keys:', Object.keys(command));
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    	}
	}
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		console.log('Deploying commands JSON:');
		console.log(JSON.stringify(commands, null, 2));

		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		console.error(error);
	}
})();
