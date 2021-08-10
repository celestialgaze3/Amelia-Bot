/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Modifies the current queues volume',
			category: 'Music',
			guildOnly: true
		});
	}

	async run(message, [newVolume]) {
		if (!this.client.music.isInChannel(message)) return;
		if (!this.client.music.canModifyQueue(message)) return;

		const { player, embed } = this.client;

		const queue = player.getQueue(message.guild.id);

		if (!queue || !queue.playing) {
			const noQueue = new MessageEmbed()
				.setDescription('The server queue is currently empty')
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [noQueue] });
		}

		if (!newVolume && isNaN(newVolume)) {
			const voiceEmbed = new MessageEmbed()
				.setDescription(`The current volume is set at: **${queue.volume}%**`)
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [voiceEmbed] });
		}

		queue.setVolume(parseInt(newVolume));

		const volumeSetEmbed = new MessageEmbed()
			.setDescription(`The volume has been set to: **${parseInt(newVolume)}%**`)
			.setColor(embed.color.default);
		return message.channel.send({ embeds: [volumeSetEmbed] });
	}

};
