/* eslint-disable no-inline-comments */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ship')
		.setDescription('Calculate ship compatibility between two users')
		.addUserOption(option =>
			option.setName('user1')
				.setDescription('First user')
				.setRequired(true))
		.addUserOption(option =>
			option.setName('user2')
				.setDescription('Second user')
				.setRequired(true)),
	async execute(interaction) {
		const user1 = interaction.options.getUser('user1');
		const user2 = interaction.options.getUser('user2');

		// --- Base Score via hash ---
		const normalize = str => str.toLowerCase().replace(/\s+/g, '');
		const baseString = normalize(user1.username) + normalize(user2.username);
		const hash = crypto.createHash('sha256').update(baseString).digest('hex');
		let score = parseInt(hash.slice(0, 9), 16) % 101;

		// --- Name bonuses ---
		const sharedLetters = [...new Set(user1.username.toLowerCase())]
			.filter(c => user2.username.toLowerCase().includes(c));
		if (sharedLetters.length >= 2) score *= 1.05;
		if (user1.username[0].toLowerCase() === user2.username[0].toLowerCase()) score *= 1.05;

		// --- Daily sway ---
		const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
		const swaySeed = parseInt(crypto.createHash('sha256').update(today).digest('hex').slice(0, 8), 16);
		const sway = ((swaySeed % 7) - 3); // -3% to +3%
		score = Math.min(100, Math.max(0, score + (score * sway / 100)));

		// --- Orthographic & Phonetic Analysis ---
		const vowels = user1.username.match(/[aeiou]/gi)?.length || 0;
		const consonants = user1.username.length - vowels;
		const alliteration = user1.username[0].toLowerCase() === user2.username[0].toLowerCase();
		const sameLength = user1.username.length === user2.username.length;
		const sharedEnding = user1.username.slice(-2).toLowerCase() === user2.username.slice(-2).toLowerCase();
		const rhythmBonus = vowels / (vowels + consonants);
		const orthographicScore = alliteration + sameLength + sharedEnding + rhythmBonus;
		score = Math.min(100, score + orthographicScore * 5);

		// --- Qualitative message ---
		let message = '';
		let emoji = '';
		if (score >= 90) { message = '💖 Perfect match! Strong synergy between names and vibes.'; emoji = '💞'; }
		else if (score >= 70) { message = '💘 Great pairing! Many compatibilities align.'; emoji = '💗'; }
		else if (score >= 50) { message = '💛 Decent match, some quirks exist but could work.'; emoji = '💛'; }
		else if (score >= 30) { message = '💔 Low compatibility. Differences may cause friction.'; emoji = '💔'; }
		else { message = '🖤 Unlikely match. You might clash in multiple ways.'; emoji = '🖤'; }

		const embed = new EmbedBuilder()
			.setTitle(`${emoji} Ship Compatibility`)
			.setDescription(`**${user1.username}** x **${user2.username}**`)
			.addFields(
				{ name: 'Compatibility Score', value: `**${Math.round(score)}%**`, inline: true },
				{ name: 'Verdict', value: message, inline: false }
			)
			.setThumbnail(user1.displayAvatarURL({ dynamic: true }))
			.setImage('https://i.imgur.com/UWbYQJ9.png') // Replace with your image URL
			.setColor(score >= 70 ? 0xFF69B4 : 0xFFA500) // Pink if high, orange if medium
			.setFooter({ text: '💌 Hope it works out!', iconURL: user2.displayAvatarURL({ dynamic: true }) })
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
	global: true
};


// - Hash-based consistency
// Concatenate normalized names (user 1 + 2)
// Generate a hash
// Take the first 9 digits of the hash and into an integer
// That's the base score

// - Users names
// +5% if both names share 2 letters and/or start with the same character

// - Message content
// For example if user 1 called user 2 a relationship nickname, add a couple of point and make sure it's consistent and not one off

// - Users bio
// If both users or one user has the other username or the first letter of their name, add more points

// - Daily sway
// Generate a small random offset (-3% - +3%) every day using the current date as a seed

// - Extra details
// Assign qualitative messages and reasonings based on the final score
// Add vowel, consonant, alliteration, rhythm, syllable count and orthographic symmetry (same length in letters, shared ending letters)