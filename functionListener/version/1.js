module.exports = async function (req, res, logger, di) {
    try {

        // Test
        logger.log(req.body);

        /* 
    
            req.body.token = Response Token
            req.body.public_flags = User Public Flags
            req.body.avatar = User Avatar ID
            req.body.discriminator = User Discriminator
            req.body.username = User Name
            req.body.id = User ID

// https://discord.com/developers/docs/interactions/slash-commands#responding-to-an-interaction
{
    "token": "A_UNIQUE_TOKEN",
    "member": { 
        "user": {
            "id": 53908232506183680,
            "username": "Mason",
            "avatar": "a_d5efa99b3eeaa7dd43acca82f5692432",
            "discriminator": "1337",
            "public_flags": 131141
        },
        "roles": ["539082325061836999"],
        "premium_since": null,
        "permissions": "2147483647",
        "pending": false,
        "nick": null,
        "mute": false,
        "joined_at": "2017-03-13T19:19:14.040000+00:00",
        "is_pending": false,
        "deaf": false 
    },
    "id": "786008729715212338", // Interaction ID
    "guild_id": "290926798626357999",
    "data": { 
        "options": [{
            "name": "cardname",
            "value": "The Gitrog Monster"
        }],
        "name": "cardsearch",
        "id": "771825006014889984" 
    },
    "channel_id": "645027906669510667" 
}
        
        */

        // Is Command
        if (req.body.type === di.InteractionType.COMMAND) {

            // Test
            res.json({
                type: di.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    tts: false,
                    content: 'Hello world',
                    embeds: [],
                    allowed_mentions: []
                },
            });

        }

        // Ping
        else if (req.body.type === di.InteractionType.PING) {
            res.json({ type: di.InteractionResponseType.PONG });
        }

        // Nope
        else {
            return tinyCfg.errorCallback(res, 404, 'Type not found!');
        }

        // Complete
        return;

    } catch (err) {
        logger.error(err);
        tinyCfg.errorCallback(res, 404, 'Version not found!');
        return;
    }
};