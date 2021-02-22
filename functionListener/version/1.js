module.exports = async function (req, res, logger, di, tinyCfg) {
    try {

        // Is Command
        if (req.body.type === di.InteractionType.COMMAND) {

            // Obj Type
            const objType = require('@tinypudding/puddy-lib/get/objType');

            // Exist Commands
            if (
                objType(tinyCfg.commands, 'object') && objType(req.body.data, 'object') &&
                (typeof req.body.data.name === "string" || typeof req.body.data.name === "number") &&
                (typeof req.body.id === "string" || typeof req.body.id === "number")
            ) {

                // Final Result
                const final_result = {
                    data: req.body, di: di, res: res, get: {

                        // Author
                        author: function (interaction) {

                            // Result
                            const result = {};

                            // ID
                            result.id = interaction.member.user.id;

                            // Username
                            result.nick = interaction.member.nick;
                            result.username = interaction.member.user.username;
                            result.discriminator = interaction.member.user.discriminator;
                            result.tag = result.username + '#' + result.discriminator;

                            // Name
                            if (typeof interaction.member.nick === "string") {
                                result.name = interaction.member.nick;
                            } else if (typeof interaction.member.user.username === "string") {
                                result.name = interaction.member.user.username;
                            }

                            // Complete
                            return result;

                        },

                        // User
                        user: function() {
                            
                        }

                    }
                };

                // Normal Callback
                if (!tinyCfg.forceInvalidCommandCallback) {

                    // Get by name
                    if (typeof tinyCfg.commands[req.body.data.name] === "function") {
                        tinyCfg.commands[req.body.data.name](final_result);
                    }

                    // Get by name
                    else if (typeof tinyCfg.commands[req.body.id] === "function") {
                        tinyCfg.commands[req.body.id](final_result);
                    }

                    // Nothing
                    else {
                        tinyCfg.invalidCommandCallback(final_result);
                    }

                }

                // Nope
                else {
                    tinyCfg.invalidCommandCallback(final_result);
                }

            }

            // Nope
            else {
                tinyCfg.errorCallback(req, res, 500, 'The commands could not be loaded!');
            }

        }

        // Ping
        else if (req.body.type === di.InteractionType.PING) {
            res.json({ type: di.InteractionResponseType.PONG });
        }

        // Nope
        else {
            tinyCfg.errorCallback(req, res, 404, 'Type not found!');
        }

        // Complete
        return;

    } catch (err) {
        logger.error(err);
        tinyCfg.errorCallback(req, res, 500, 'Server Error!');
        return;
    }
};