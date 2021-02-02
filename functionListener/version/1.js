module.exports = async function (req, res, logger, di, tinyCfg) {
    try {

        // Is Command
        if (req.body.type === di.InteractionType.COMMAND) {

            // Obj Type
            const objType = require('@tinypudding/puddy-lib/get/objType');

            // Exist Commands
            if (
                objType(tinyCfg.commands) && objType(req.body.data) && 
                (typeof req.body.data.name === "string" || typeof req.body.data.name === "number") &&
                (typeof req.body.id === "string" || typeof req.body.id === "number")
            ) {

                // Get by name
                if (typeof tinyCfg.commands[req.body.data.name] === "function") {
                    tinyCfg.commands[req.body.data.name](req.body, res, di);
                }

                // Get by name
                else if (typeof tinyCfg.commands[req.body.id] === "function") {
                    tinyCfg.commands[req.body.id](req.body, res, di);
                }

                // Nothing
                else {
                    tinyCfg.invalidCommandCallback(req.body, res, di);
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