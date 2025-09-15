const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');
const { version: djsVersion } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('debug')
		.setDescription('DEVCOM: Shows bot diagnostics and debug information.'),

	async execute(interaction) {
		// Send initial reply (deferred to avoid double reply issues)
		await interaction.deferReply();

		// Round-trip latency test
		const sent = await interaction.editReply({ content: 'Pinging...', fetchReply: true });
		const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;

    	// Memory usage (in MB)
    	const memory = process.memoryUsage();
    	const formatMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

    	// Uptime formatting
    	function formatDuration(ms) {
      		const sec = Math.floor((ms / 1000) % 60);
      		const min = Math.floor((ms / (1000 * 60)) % 60);
      		const hr = Math.floor((ms / (1000 * 60 * 60)) % 24);
      		const days = Math.floor(ms / (1000 * 60 * 60 * 24));
      		return `${days}d ${hr}h ${min}m ${sec}s`;
		}

		const embed = new EmbedBuilder()
			.setColor('Random')
			.setTitle('DEBUG')
      		.addFields(
				{
          	name: 'Connection',
          	value: [
            	`WS Ping: \`${interaction.client.ws.ping}ms\``,
            	`Roundtrip: \`${roundtrip}ms\``,
            	`Uptime: \`${formatDuration(interaction.client.uptime)}\``,
          	].join('\n'),
        	},
        	{
          	name: 'System',
          	value: [
            	`Memory (RSS): \`${formatMB(memory.rss)}\``,
            	`Memory (Heap): \`${formatMB(memory.heapUsed)} / ${formatMB(memory.heapTotal)}\``,
            	`CPU Load (1m): \`${os.loadavg()[0].toFixed(2)}\``,
            	`Platform: \`${process.platform} ${os.release()}\``,
           	 	`Arch: \`${process.arch}\``,
          	].join('\n'),
        	},
        	{
          	name: 'Environment',
          	value: [
            	`Node.js: \`${process.version}\``,
            	`Discord.js: \`v${djsVersion}\``,
          	].join('\n'),
        	},
        	{
          	name: 'State',
          	value: [
            	`Guilds: \`${interaction.client.guilds.cache.size}\``,
            	`Users (cached): \`${interaction.client.users.cache.size}\``,
            	`Channels: \`${interaction.client.channels.cache.size}\``,
          	].join('\n'),
        	},
      	)
      	.setTimestamp();

    	// Replace the 'Pinging...' message with the embed
    	await interaction.editReply({ content: '', embeds: [embed] });
  	},
};