// Forked from https://github.com/MatteZ02/discord-interactions
const apiUrl = "https://discord.com/api/v8";

// Class
class InteractionsClient {

    // Constructor
    constructor(data) {

        // Get Config
        const _ = require('lodash');

        // Create Settings
        const tinyCfg = _.defaultsDeep({}, data, {
            token: '',
            client_id: '',
            client_secret: ''
        });

        // Token
        if (typeof tinyCfg.token === "string") {
            this.token = { value: tinyCfg.token, type: 'Bot' };
        }

        // Nope
        else {

            // Client Secret
            if (typeof tinyCfg.client_secret === "string") {
                this.token = { value: tinyCfg.client_secret, type: 'Bearer' };
            }

            // Nope
            else {
                throw new Error("discord-slash-commands-client | No token or client secret provided");
            }

        }

        // ID
        if (typeof tinyCfg.client_id === "string") { this.clientID = tinyCfg.client_id; }

        // Nope
        else {
            throw new Error("discord-slash-commands-client | No clientID provided");
        }

        // Return
        return this;

    }

    // Get Commands
    async getCommands(options = {}) {

        // Prepare Module
        const objType = require('@tinypudding/puddy-lib/get/objType');

        // Prepare Options
        if (!objType(options, 'object')) {
            throw "options must be of type object. Received: " + typeof options;
        }

        // No Command ID
        if (options.commandID && typeof options.commandID !== "string") {
            throw (
                "commandID received but wasn't of type string. received: " +
                typeof options.commandID
            );
        }

        // No Guild
        if (options.guildID && typeof options.guildID !== "string") {
            throw (
                "guildID received but wasn't of type string. received: " +
                typeof options.guildID
            );
        }

        // URL
        let url = options.guildID
            ? `${apiUrl}/applications/${this.clientID}/guilds/${options.guildID}/commands`
            : `${apiUrl}/applications/${this.clientID}/commands`;

        // Option
        if (options.commandID) { url += `/${options.commandID}`; };

        // Send Command
        const res = await require("axios").get(url, {
            headers: { Authorization: `${this.token.type} ${this.token.value}` }
        });

        // Complete
        return res.data;

    }

    // Create Command
    async createCommand(options, guildID) {

        // Prepare Module
        const objType = require('@tinypudding/puddy-lib/get/objType');

        // No Options
        if (!objType(options, 'object')) {
            throw "options must be of type object. Received: " + typeof options;
        }

        // No Description
        if (!options.name || !options.description) {
            throw "options is missing name or description property!";
        }

        // URL
        const url = guildID
            ? `${apiUrl}/applications/${this.clientID}/guilds/${guildID}/commands`
            : `${apiUrl}/applications/${this.clientID}/commands`;

        // Send Command
        const res = await require("axios").post(url, options, {
            headers: { Authorization: `${this.token.type} ${this.token.value}` },
        });

        // Complete
        return res.data;

    }

    // Edit Command
    async editCommand(options, commandID, guildID) {

        // Prepare Module
        const objType = require('@tinypudding/puddy-lib/get/objType');

        // No Options
        if (!objType(options, 'object')) {
            throw "options must be of type object. Received: " + typeof options;
        }

        // No Command ID
        if (typeof commandID !== "string") {
            throw "commandID must be of type string. Received: " + typeof commandID;
        }

        // No Name
        if (!options.name || !options.description) {
            throw "options is missing name or description property!";
        }

        // No Guild Name
        if (guildID && typeof guildID !== "string") {
            throw (
                "guildID received but wasn't of type string. received: " +
                typeof guildID
            );
        }

        // URL
        const url = guildID
            ? `${apiUrl}/applications/${this.clientID}/guilds/${guildID}/commands/${commandID}`
            : `${apiUrl}/applications/${this.clientID}/commands/${commandID}`;

        // Send Command
        const res = await require("axios").patch(url, options, {
            headers: { Authorization: `${this.token.type} ${this.token.value}` },
        });

        // Complete
        return res.data;

    }

    // Delete Command
    async deleteCommand(commandID, guildID) {

        // No String
        if (typeof commandID !== "string") {
            throw "commandID must be of type string. Received: " + typeof commandID;
        }

        // URL
        const url = guildID
            ? `${apiUrl}/applications/${this.clientID}/guilds/${guildID}/commands/${commandID}`
            : `${apiUrl}/applications/${this.clientID}/commands/${commandID}`;

        // Delete
        const res = await require("axios").delete(url, {
            headers: { Authorization: `${this.token.type} ${this.token.value}` },
        });

        // Complete
        return res.data;

    }

}

module.exports = InteractionsClient;
