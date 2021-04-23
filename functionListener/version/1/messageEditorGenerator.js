module.exports = function (logger, req, res, tinyCfg, interaction, messageID = '@original', version = '/v8') {

    // Get Module
    const interactionResponse = require('../../interactionResponse');

    // Prepare Response
    const response = {};

    // Edit Message
    response.edit = (data => {
        return replyMessage({
            custom_result: interactionResponse(`https://discord.com/api${version}/webhooks/${interaction.client_id}/${interaction.token}/messages/${messageID}`, {
                method: 'PATCH'
            }, { fixData: true })
        }, tinyCfg, logger, req, res)(data);
    });

    // Delete Message
    response.delete = interactionResponse(`https://discord.com/api${version}/webhooks/${interaction.client_id}/${interaction.token}/messages/${messageID}`, {
        method: 'DELETE'
    });

    // Complete
    return response;

};