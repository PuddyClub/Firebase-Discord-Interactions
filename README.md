<div align="center">
<p>
    <a href="https://discord.gg/TgHdvJd"><img src="https://img.shields.io/discord/413193536188579841?color=7289da&logo=discord&logoColor=white" alt="Discord server" /></a>
    <a href="https://www.npmjs.com/package/@tinypudding/firebase-discord-interactions"><img src="https://img.shields.io/npm/v/@tinypudding/firebase-discord-interactions.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/@tinypudding/firebase-discord-interactions"><img src="https://img.shields.io/npm/dt/@tinypudding/firebase-discord-interactions.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://www.patreon.com/JasminDreasond"><img src="https://img.shields.io/badge/donate-patreon-F96854.svg" alt="Patreon" /></a>
</p>
<p>
    <a href="https://nodei.co/npm/@tinypudding/firebase-discord-interactions/"><img src="https://nodei.co/npm/@tinypudding/firebase-discord-interactions.png?downloads=true&stars=true" alt="npm installnfo" /></a>
</p>
</div>

# Firebase-Discord-Interactions
Use Firebase Database Realtime or static data to receivve your Discord Bot's commands from the command slash.

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

### app (Object / Optional)
JSON static data to get your bot data.

### options.firebase (Object / Optional)
JSON data from your Firebase you want to get your bot data through Firebase Database Realtime.

### options.appPath (String / Optional)
The Path of your Firebase Database Realtime where you is storing your bot data.

### options.bot (Discord.JS Client / Optional)
You can insert an active or inactive Discord.JS Client to be used in conjunction with the API. (Tested in the Discord.JS 12.5.1)

### options.varNames (Object / Optional)
Here you can change the name of the http queries that will be used in the URL of your Discord Interaction Endpoint.

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

        // Reply (All JSON options explained in the official Discord Documentation can be placed here.)
        return result.reply({
            tts: false,
            content: 'Pong!',
            embed: embed
        })
        
        // Result
        .then(data => {
            console.log(result.data.id + ' was replied!');
            console.log(data);
        })
        
        // Error
        .catch(err => {
            console.log(result.data.id + ' returned a error!');
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

### result.cfg
All the configurations that are being used in the module will appear here.

### result.interaction
All your interaction data is here.