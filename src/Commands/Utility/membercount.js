const { MessageEmbed } = require('discord.js');
const { createCanvas } = require('node-canvas');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Provides the total number of members',
			category: 'Utility',
			guildOnly: true
		});
	}

	async run(message) {
		const memberCache = await message.guild.members.fetch({ withPresences: true });
		const statusData = await this.fetchStatusData(message);

		const canvas = createCanvas(700, 400);
		const ctx = canvas.getContext('2d');
		const totalMembers = memberCache.size;

		this.createRect(ctx);
		this.createPiChart(ctx, canvas, statusData, totalMembers);
		this.createStatusOverlay(ctx, statusData, totalMembers);

		const memberCountEmbed = new MessageEmbed()
			.setAuthor(`${message.guild.name} Member Count`, message.guild.iconURL())
			.setImage('attachment://userChart.png')
			.addField(`Total Members`, `${totalMembers} members`, true)
			.addField(`Total Humans`, `${memberCache.filter(member => !member.user.bot).size} Humans`, true)
			.addField(`Total Bots`, `${memberCache.filter(member => member.user.bot).size} Bots`, true)
			.setColor(this.client.embed.color.default);
		return message.channel.send({ embeds: [memberCountEmbed], files: [{ attachment: canvas.toBuffer(), name: 'userChart.png' }] });
	}

	async fetchStatusData(message) {
		const statusData = [
			{ status: 'Online', amount: 0, color: '#62ce74' },
			{ status: 'Idle', amount: 0, color: '#ebc83d' },
			{ status: 'DND', amount: 0, color: '#F04747' },
			{ status: 'Streaming', amount: 0, color: '#b06dad' },
			{ status: 'Offline', amount: 0, color: '#5d5d5d' }
		];


		await message.guild.members.fetch({ withPresences: true }).then(userList => {
			userList.forEach(user => {
				const userStatus = user.presence ? user.presence.status : 'offline';
				const statusObject = statusData.find(val => val.status.toLowerCase() === userStatus);
				statusObject.amount += 1;
			});
		});

		return statusData;
	}

	createRect(ctx) {
		const rectXPos = 340;
		const rectYPos = 110;
		const rectHeight = 170;
		const rectWidth = 250;

		ctx.beginPath();
		ctx.lineWidth = '3';
		ctx.strokeStyle = '#7b8085';
		ctx.fillStyle = '#1b2228';
		ctx.rect(rectXPos, rectYPos, rectWidth, rectHeight);
		ctx.fillStyle = '1c2229';
		ctx.fillRect(rectXPos, rectYPos, rectWidth, rectHeight);
		ctx.stroke();
		ctx.closePath();
	}

	createPiChart(ctx, canvas, statusData, totalMembers) {
		let startAngle = 0;
		const radius = 100;
		const cx = canvas.width / 4;
		const cy = canvas.height / 2;

		for (let i = 0; i < statusData.length; i++) {
			ctx.fillStyle = statusData[i].color;
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000000';
			ctx.beginPath();

			const endAngle = ((statusData[i].amount / totalMembers) * Math.PI * 2) + startAngle;

			ctx.moveTo(cx, cy);
			ctx.arc(cx, cy, radius, startAngle, endAngle, false);
			ctx.lineTo(cx, cy);
			ctx.fill();
			// ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			ctx.closePath();

			startAngle = endAngle;

			// ctx.stroke();
		}
	}

	createStatusOverlay(ctx, statusData, totalMembers) {
		const statusBoxHeight = 18;
		const statusBoxWidth = 18;
		const statusBoxX = 350;
		let statusBoxY = 125;

		for (let i = 0; i < statusData.length; i++) {
			ctx.fillStyle = statusData[i].color;
			ctx.beginPath();
			ctx.fillRect(statusBoxX, statusBoxY, statusBoxHeight, statusBoxWidth);
			ctx.rect(statusBoxX, statusBoxY, statusBoxHeight, statusBoxWidth);
			ctx.closePath();

			const { status, amount } = statusData[i];
			ctx.font = '20px uni sans';
			ctx.fillStyle = 'white';

			ctx.fillText(`${status} - ${amount} (${(100 * amount / totalMembers).toFixed(2)}%)`, statusBoxX + 30, statusBoxY + 15);
			statusBoxY += 30;
		}
	}

};
