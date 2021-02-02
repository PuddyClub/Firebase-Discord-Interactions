// Tiny Config
const tinyCfg = require('../config.json');

// Create Bot
const Discord = require('discord.js');
bot = new Discord.Client({ autoReconnect: true });

// Run Module
require('../../templates/discord')(bot, (msg) => {

    // Debug Message
    console.log(msg);

    // Complete
    return;

});

// Login
bot.login(tinyCfg.gateway_test_token).catch(err => { logger.error(err); return; });