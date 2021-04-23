module.exports = function (logger, req, res, tinyCfg, interaction, version = '/v8') {

    // Get Module
    const interactionResponse = require('../../interactionResponse');

    // Return
    return function (data) {
        return new Promise(function (resolve, reject) {

            // Result
            interactionResponse(`https://discord.com/api${version}/webhooks/${interaction.client_id}/${interaction.token}`, {
                method: 'POST'
            }, { fixData: true })(data).then(data => {
                resolve({ data: data, msg: messageEditorGenerator(logger, req, res, tinyCfg, interaction, data.id) });
                return;
            }).catch(err => {
                reject(err);
                return;
            });

            // Complete
            return;

        });
    };

};