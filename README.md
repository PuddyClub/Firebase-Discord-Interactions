<div align="center">
<p>
    <a href="https://discord.gg/TgHdvJd"><img src="https://img.shields.io/discord/413193536188579841?color=7289da&logo=discord&logoColor=white" alt="Discord server" /></a>
    <a href="https://www.npmjs.com/package/@tinypudding/firebase-discord-interactions"><img src="https://img.shields.io/npm/v/@tinypudding/firebase-discord-interactions.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/@tinypudding/firebase-discord-interactions"><img src="https://img.shields.io/npm/dt/@tinypudding/firebase-discord-interactions.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://www.patreon.com/JasminDreasond"><img src="https://img.shields.io/badge/donate-patreon-F96854.svg?logo=patreon" alt="Patreon" /></a>
    <a href="https://ko-fi.com/jasmindreasond"><img src="https://img.shields.io/badge/donate-ko%20fi-29ABE0.svg?logo=ko-fi" alt="Ko-Fi" /></a>
</p>
<p>
    <a href="https://nodei.co/npm/@tinypudding/firebase-discord-interactions/"><img src="https://nodei.co/npm/@tinypudding/firebase-discord-interactions.png?downloads=true&stars=true" alt="npm installnfo" /></a>
</p>
</div>

# Firebase-Discord-Interactions
Use Firebase Database Realtime or static data to receive your Discord Bot's commands from the command slash.

This module can be used as a plugin for the Discord.JS via Gateway API.

If you use this module as a webhook request, your final URL will be: https://{your-domain}/{your-url-path}?type=endpoint&bot={bot-object-name-in-your-file-config}

<hr/>

## Function Listener
This method is used within your HTTP request using the Express module.
Once your request and response is sent into the module, the entire process will be done automatically.

### req
The Request Value from the express app module.

### res
The Response Value from the express app module.

### options
The module settings will be defined here.

### options.errorCallback (Function)
The errors that happen in the module will appear here for you to send a response to the Discord Endpoint.

### options.invalidCommandCallback (Function)
If you receive an invalid command, it will be sent to this function.

### options.commands (Object)
All of your commands should be here. Each object Key must be a command ID or a command name.
All returned values are the same as the "options.invalidCommandCallback".

### options.app (Object / Optional)
JSON static data to get your bot data.

### options.firebase (Object / Optional)
JSON data from your Firebase you want to get your bot data through Firebase Database Realtime.

### options.appPath (String / Optional)
The Path of your Firebase Database Realtime where you is storing your bot data.

### options.bot (Discord.JS Client / Optional)
You can insert an active or inactive Discord.JS Client to be used in conjunction with the API. (Tested in the Discord.JS 12.5.1)

### options.varNames (Object / Optional)
Here you can change the name of the http queries that will be used in the URL of your Discord Interaction Endpoint.

### options.debug (Boolean / Optional)
Enable the debug log.

### options.actionNotifications (Boolean / Optional)
Disable Action Notifications in the Log.

### options.forceInvalidCommandCallback (Boolean / Optional)
All commands will always return to the Invalid Command method.

### options.hiddenDetector.value (String or Array with Strings)
Place a boolean value name that will be searched inside the booleans of the command. If the name of the value is found and the value is true, the message will only be visible to the user.

"null" will disable this feature.

```js
// Get Function Listener Base
const functionListener = require('@tinypudding/firebase-discord-interactions/functionListener');

// Options
const options = {

    // Error Callback
    errorCallback: async function (req, res, code, message) {
        return res.json({ errorCode: code, message: message })
    },

    // Invalid Command
    invalidCommandCallback: function (result) {
        return result.reply('This command has no functionality!');
    },

    // Firebase
    firebase: {
        app: cfg.firebase,
        options: cfg.options
    },

    // Path
    appPath: 'apps',

    // Commands
    commands: commands,

    // Varnames
    varNames: varNames,

    // App
    app: app,

    // Bot
    bot: bot

};

// Start Module
functionListener(req, res, options);
```

## JSON Values
The JSON Value Examples

### commands
```js
const commands = {
    ping: function (result) {

        // Embed (Discord.JS API converted to normal JSON Vanilla from the official Discord Documentation)
        const Discord = require('discord.js');
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

        // Reply (https://discord.com/developers/docs/interactions/slash-commands#responding-to-an-interaction)
        return result.reply({
            tts: false,
            content: 'Pong!',
            embed: embed
        })
        
        // Result
        .then(data => {
            console.log(result.interaction.id + ' was replied!');
            console.log(data);
        })
        
        // Error
        .catch(err => {
            console.log(result.interaction.id + ' returned a error!');
            console.error(err);
        });

    }
};
```

### varNames
```json
{
    "type": "type",
    "bot": "bot"
}
```

### app
```json
{
    "test": {
        "client_id": "",
        "public_key": "",
        "bot_token": ""
    }
}
```

<hr/>

## Command Callback
Both valid commands and invalid commands, you will receive the same values and methods to use when sending a response to the Discord Command Slash Endpoint.

### result.bot (Discord.JS Client)
If your interaction application has a valid Bot Token, this value will be converted to a Discord.JS Client. (The gateway values will only work if you are using Discord.JS Gateway Mode)

### result.cfg (Object)
All the configurations that are being used in the module will appear here.

### result.interaction (Object)
All your interaction data is here.

### result.di (Module)
The module "discord-interactions" data.

### result.res (Promise)
The vanilla Express Response.
It is recommended that you use only the methods: res.status | res.json

### result.reply(msg, msgType) [msgType = 'default' or 'temp'] (Promise)
Place a string or an object with the JSON values.

msg - String or Object of the messaage that will be returned to the Discord Interaction Endpoint API. Your values will be sent to "json.data".

https://discord.com/developers/docs/interactions/slash-commands#responding-to-an-interaction

Special Values:
```js
result.reply({ content: 'Test!', visible: false }); // The message will be visible only to the command sender.
```

msgType - Your Reply Type to be sent to the Discord Interaction Endpoint.
```
Default: A normal message reply 
Temp: Reply the message using a DeferredChannelMessageWithSource response. You will need to use the result.msg.edit to send your final reply and the result.pong to finish the request response.
```

### result.get
Quick systems to obtain values that are within your slash command.<br/>
```js
result.get.author() // return the message author.

result.get.user(optionName, value, forceBot); // return a promise with the mentioned user. If the command value fails, it will return null. If the command value does not find the value, it will return false.
result.get.channel(optionName, value, forceBot); // return a promise with the mentioned channel. If the command value fails, it will return null. If the command value does not find the value, it will return false.
result.get.role(optionName, value, forceBot); // return a promise with the mentioned role. If the command value fails, it will return null. If the command value does not find the value, it will return false.
// forceBot will force the Discord.JS values from the mentioned value if you are using the Discord.JS with the module. The all data will be stored in the value "result.interaction.data.discordjs"
// If the value of "value" is string, it will return the value just exactly the value of the string.

result.get.boolean(optionName); // return a boolean value.
result.get.integer(optionName); // return a integer value.
result.get.string(optionName); // return a string value.

result.get.subCommand(optionName); // The value can be String or Array with Strings. This method will look for which of the Strings is the selected subcommand. You will receive the selected subcommand value and another "get method" to search for the next option inside the subcommand.
result.get.subCommandGroup(optionName, subCommandName, itemName); // return a subCommand group value. (Not Tested)
```

### result.types
Object of numbers with the option types for the value of "result.interaction.data[0].type".
```js
result.types.boolean;
result.types.channel;
result.types.integer;
result.types.role;
result.types.string;
result.types.user;
result.types.sub_command;
result.types.sub_command_group;
```

<hr/>

## Not tested.

### result.msg.delete
Delete the message.

### result.msg.edit
Send a json in the first argument to edit the message.
(All JSON options explained in the official Discord Documentation can be placed here.)

### result.newMsg
Send a json in the first argument to create a message.
(All JSON options explained in the official Discord Documentation can be placed here.)

<hr/>

## Gateway
You can use your bot through a Gateway of Discord Interactions with the Discord.JS module and the results will be the same as in the examples mentioned above. The only thing that will be changed is how to build the initial code.

If you enable the value "followMode", when a message is sent by the Gateway, it first responds to the message using a DeferredChannelMessageWithSource. When you use the "result.reply()", the final result of your message will be sent.

```js
// Tiny Config
const tinyCfg = require('../../config.json');
const Discord = require('discord.js');
const bot = new Discord.Client({ autoReconnect: true });
const followMode = true;
const ACKMessage = 'Loading...';

// The Ready Message
bot.on('ready', () => { logger.log(`Bot Ready! ${bot.user.tag} (${bot.user.id})`); return; });

// Insert the Discord.JS Client into the Cfg Bot Value
tinyCfg.bot = bot;

// Error Callback
tinyCfg.errorCallback = function () {
    return;
};

// Invalid Command Callback
tinyCfg.invalidCommandCallback = function (result) {

    // Reply
    return result.reply('This command has no functionality!').then(data => {
        console.log(result.interaction.id + ' was replied!');
        console.log(data);
    }).catch(err => {
        console.log(result.interaction.id + ' returned a error!');
        console.error(err);
    });

};

// Command List
tinyCfg.commands = commands;
tinyCfg.commandsMenu = function (result) {
    return result.reply({ tts: false, content: 'Pong!'});
};

// Prepare Gateway
const interactionsGateway = require('@tinypudding/firebase-discord-interactions/functionListener/gateway');

// Start Interaction Gateway
interactionsGateway(tinyCfg, bot, followMode, ACKMessage);

// Start the Discord.JS Gateway
bot.login('BOT_TOKEN');

```

<hr/>

## Hosting a server to reply commands from external client servers
You can easily create a server to respond to the commands sent by the user. 
This server does not use the traditional HTTP firebase system. Here you will use the HTTP Callback system from Firebase.

You can create a client server manually or you can use the fully developed module to receive the server module requests.

https://www.npmjs.com/package/@tinypudding/discord-firebase-async-server

### Example
```js

// Error Page
const json_error_page = function (res, code, message) {
    res.status(code);
    return res.json({error: true, code: code, message: message});
};

// The Callback Firebase
exports.apiCallbackExample = functions.https.onCall(async (data) => { 
    
    // "data" is a value that will simulate a Request of the Express module when you call the "apiCallbackExample" with the data value. 

    // Prepare a Config File
    const tinyCfg = require('./configGenerator')(data, json_error_page);

    // Call the Server
    const discordInteractionServer = require('@tinypudding/firebase-discord-interactions/functionListener/firebaseCallback/server');
    const result = await discordInteractionServer(functions, tinyCfg, data); 
    
    // Send a response back to your node server.
    return result;

});
```

### configGenerator.js
```js
module.exports = function (req, error_page) {

        // Var Names
        const varNames = {

            // Type
            type: 'type',

            // Bot
            bot: 'bot'

        };

        // Modules
        const objType = require('@tinypudding/puddy-lib/get/objType');
        const appConfig = require('./apps.json');

        // Prepare Command List
        let commands = {};
        try {
            commands = require('../commands/' + req.query[varNames.bot].replace(/\//g, '').replace(/\\/g, ''));
            if (!objType(commands, 'object')) { commands = {}; }
        } catch (err) {
            commands = {};
        }

        // DiscordJS
        let bot = null;
        if(Object.keys(commands).length > 0) {
            const Discord = require('discord.js');
            bot = new Discord.Client();
        }

        // Result
        return {

            // Error Callback
            errorCallback: async function (req, res, code, message) {
                const logger = require('@tinypudding/firebase-lib/logger');
                await logger.log({ errorCode: code, message: message });
                return error_page(res, code, message)
            },

            // Invalid Command
            invalidCommandCallback: function (result) {
                return result.reply('This command has no functionality!');
            },

            // Path
            commands: commands,
            varNames: varNames, 
            app: appConfig,
            bot: bot

        };

};
```

### apps.json
```json
{
    "test": {
        "client_id": "",
        "public_key": "",
        "bot_token": ""
    }
}
```