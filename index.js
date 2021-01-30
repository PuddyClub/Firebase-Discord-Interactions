module.exports = function (data) {

    // Prepare Functions
    let functions = null;
    try {
        functions = require('firebase-functions');
    } catch (err) {
        functions = null;
    }

    // Start Module
    if (functions) {

        // Prepare Modules
        const _ = require('lodash');

        // Create Settings
        const tinyCfg = _.defaultsDeep({}, data, {
            path: '/',
            database: ''
        });

        // Script Base
        const discordCommandChecker = (snapshot, context) => {

            // Complete
            return;

        };

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

};