const AmeliaClient = require('./Structures/AmeliaClient');
const { Player } = require('discord-player');
const config = require('../config.json');

const client = new AmeliaClient(config);
client.player = new Player(client);

client.start();
