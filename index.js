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
    const discordCommandChecker = async (snapshot) => {

        // Prepare Data
        const apps = snapshot.val();

        // Exist Data
        if (objType(apps, 'object')) {

            // Prepare Bot DB
            const db = app.db.ref(tinyCfg.botPath);
            const getDBData = require('@tinypudding/firebase-lib/getDBData');
            const interactionsClient = require("@tinypudding/discord-slash-commands/client");

            // Read Apps
            await require('for-promise')({ data: apps }, function (app, fn) {

                // Read Token
                getDBData(db.child(app).child('token')).then(token => {

                    // Is a Token String
                    if (typeof token === "string") {

                        // Create Client
                        const client = new interactionsClient({
                            client_id: apps[app].client_id,
                            bot_token: token
                        });

                        // list all your existing commands.
                        client.getCommands().then(oldCommands => {

                            // Is Array
                            if (Array.isArray(oldCommands)) {

                                // Exist Global Command List
                                if (objType(apps[app].commands, 'object') && Array.isArray(apps[app].commands.global)) {

                                    // New Commands
                                    const newCommands = apps[app].commands.global;
                                    console.log(newCommands);

                                }

                                // Test
                                console.log(oldCommands);

                                // Complete
                                fn(); return;

                            }

                            // Nope
                            else {
                                fn(); return;
                            }


                        }).catch(err => {
                            logger.error(err); fn(); return;
                        });

                    }

                    // Nope
                    else { fn(); }

                    // Complete
                    return;

                }).catch(err => {
                    logger.error(err); fn(); return;
                });

                // Complete
                return;

            });

            // Console Test
            console.log('Complete');

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