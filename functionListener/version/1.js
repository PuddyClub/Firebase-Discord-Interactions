module.exports = async function (req, res, logger, di, tinyCfg) {
    try {

        // Is Command
        if (req.body.type === di.InteractionType.COMMAND) {

            if() {

            }

        }

        // Ping
        else if (req.body.type === di.InteractionType.PING) {
            res.json({ type: di.InteractionResponseType.PONG });
        }

        // Nope
        else {
            return tinyCfg.errorCallback(req, res, 404, 'Type not found!');
        }

        // Complete
        return;

    } catch (err) {
        logger.error(err);
        tinyCfg.errorCallback(req, res, 500, 'Server Error!');
        return;
    }
};