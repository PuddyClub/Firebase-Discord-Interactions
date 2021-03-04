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

### options.firebase (Object / Optional)
JSON data from your Firebase you want to get your bot data through Firebase Database Realtime.

### options.appPath (String / Optional)
The Path of your Firebase Database Realtime where you is storing your bot data.

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
    commands: commands,
    varNames: varNames

};

// Start Module
functionListener(req, res, options);
```