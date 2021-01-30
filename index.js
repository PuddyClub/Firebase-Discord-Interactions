module.exports = function (data, isTest = false, app) {

    // Prepare Modules
    const _ = require('lodash');

    // Create Settings
    const tinyCfg = _.defaultsDeep({}, data, {
        path: '/',
        database: ''
    });

    // Script Base
    const discordCommandChecker = (snapshot) => {

        // Complete
        return;

    };

    // Detect No Test Mode
    if (!isTest) {
        try {
            isTest = require('@tinypudding/firebase-lib/isEmulator')();
        } catch (err) {
            isTest = false;
        }
    }

    // Logger
    let logger = null;
    try {
        logger = require('@tinypudding/firebase-lib/logger');
    } catch (err) {
        logger = console;
    }

    // Production
    if (isTest) {

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
            return {

                onWrite: functions.database.instance(tinyCfg.database).ref(tinyCfg.path).onWrite(discordCommandChecker),
                onCreate: functions.database.instance(tinyCfg.database).ref(tinyCfg.path).onCreate(discordCommandChecker),
                onUpdate: functions.database.instance(tinyCfg.database).ref(tinyCfg.path).onUpdate(discordCommandChecker),
                onDelete: functions.database.instance(tinyCfg.database).ref(tinyCfg.path).onDelete(discordCommandChecker),

            };

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
            const db = app.db.ref(tinyCfg.path);

        } catch (err) {
            logger.error(err);
        }

    }

    // Complete
    return;

};