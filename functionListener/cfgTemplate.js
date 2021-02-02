module.exports = function (cfg) {
    return require('lodash').defaultsDeep({}, cfg, {

        // Commands
        commands: {},

        // Var Names
        varNames: {

            // Type
            type: 'type'

        },

        // Error Callback
        errorCallback: function (req, res, code, message) {
            res.status(code);
            return res.json({ error: true, code: code, message: message });
        },

        // Invalid Command
        invalidCommandCallback: function (data, res, di) {
            return res.json({
                type: di.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    tts: false,
                    content: 'This command has no functionality!'
                },
            });
        }

    });
};