module.exports = function(cfg) {
    return require('lodash').defaultsDeep({}, cfg, {

        clientCfg: { autoReconnect: true },

        hiddenDetector: {
            value: 'hide'
        },

        // Commands
        commands: {},

        // Debug
        debug: false,

        // Actions Notifications
        actionNotifications: true,

        // Var Names
        varNames: {

            // Type
            type: 'type',

            // Bot
            bot: 'bot'

        },

        // Get Client ID
        getClientID: true,

        // Error Callback
        errorCallback: function(req, res, code, message) {
            res.status(code);
            return res.json({ error: true, code: code, message: message });
        },

        // Invalid Command
        invalidCommandCallback: function(result) {
            return result.res.json({
                type: result.di.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    tts: false,
                    content: 'This command has no functionality!'
                },
            });
        },

        // Force Invalid Command
        forceInvalidCommandCallback: false,

        // App Path
        appPath: '/',

    });
};