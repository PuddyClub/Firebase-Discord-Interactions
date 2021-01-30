module.exports = function (data, app, isTest = false) {

    // Prepare Modules
    const _ = require('lodash');
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // Create Settings
    const tinyCfg = _.defaultsDeep({}, data, {
        path: '/',
        database: ''
    });

    // Script Base
    const discordCommandChecker = (snapshot) => {

        // Prepare Data
        const data = snapshot.val();

        // Exist Data
        if (objType(data, 'object')) {

            // Prepare Bot DB
            const db = app.db.ref(tinyCfg.botPath);
            const interactions = require("discord-slash-commands-client");

            // Read Apps
            

            // Console Test
            console.log(data);

        }

        // Nope
        else {



        }

        // Complete
        return;

    };

    // Logger
    let logger = null;
    try {
        logger = require('@tinypudding/firebase-lib/logger');
    } catch (err) {
        logger = console;
    }

    // Production
    if (!isTest) {

        // Prepare Functions
        let functions = null;
        try {
            functions = require('firebase-functions');
        } catch (err) {
            functions = null;
        }

        // Start Module
        if (functions) {

            // Prepare Base
            return functions.database.instance(tinyCfg.database).ref(tinyCfg.appPath).onWrite(discordCommandChecker);

        }

        // Nope
        else {
            return null;
        }

    }

    // Test Mode
    else {

        try {

            // Prepare Test DB
            const db = app.db.ref(tinyCfg.appPath);

            // Insert Value
            db.on("value", discordCommandChecker);

        } catch (err) {
            logger.error(err);
        }

    }

    // Complete
    return;

};