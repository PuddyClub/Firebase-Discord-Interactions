// Tiny Config
const tinyCfg = require('../../config.json');
const Discord = require('discord.js');
const bot = new Discord.Client({ autoReconnect: true });

// Logger
let logger = null;
try {
    logger = require('@tinypudding/firebase-lib/logger');
} catch (err) {
    logger = console;
}

// Logs
bot.on('rateLimit', (data) => { logger.warn(data); return; });
bot.on('warn', (data) => { logger.warn(data); return; });
bot.on('error', (data) => { logger.error(data); return; });

bot.on('ready', () => { logger.log(`Bot Ready! ${bot.user.tag} (${bot.user.id})`); return; });

// Bot
tinyCfg.bot = bot;

// Error Callback
tinyCfg.errorCallback = function () {
    return;
};

// Invalid Command
tinyCfg.invalidCommandCallback = function (result) {

    // Debug
    console.log('Command Received!');
    console.log(result.data);

    // Reply
    return result.reply('This command has no functionality!').then(data => {
        console.log(result.data.id + ' was replied!');
        console.log(data);
    }).catch(err => {
        console.log(result.data.id + ' returned a error!');
        console.error(err);
    });

};

// Embed Reference: https://github.com/leovoel/embed-visualizer

// Invalid Command
tinyCfg.commands = {

    pudding: function (result) {

        // Debug
        console.log('Pudding Command Received!');
        console.log(result);

        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Some title')
            .setURL('https://discord.js.org/')
            .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Some description here')
            .setThumbnail('https://i.imgur.com/wSTFkRM.png')
            .addFields(
                { name: 'Regular field title', value: 'Some value here' },
                { name: '\u200B', value: '\u200B' },
                { name: 'Inline field title', value: 'Some value here', inline: true },
                { name: 'Inline field title', value: 'Some value here', inline: true },
            )
            .addField('Inline field title', 'Some value here', true)
            .setImage('https://i.imgur.com/wSTFkRM.png')
            .setTimestamp()
            .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png')
            .toJSON();


        // Reply
        return result.reply({
            tts: false,
            content: 'Your [pudding](https://puddy.club/) is here! 🍮',
            embed: embed
        }).then(data => {
            console.log(result.data.id + ' was replied with a pudding!');
            console.log(data);
        }).catch(err => {
            console.log(result.data.id + ' returned a error with a pudding!');
            console.error(err);
        });

    }

};

// Start Module
require('../../../functionListener/gateway')(tinyCfg, bot);
bot.login(tinyCfg.gateway_test_token);