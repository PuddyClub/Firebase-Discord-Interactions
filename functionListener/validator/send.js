module.exports = function (req, res, logger, tinyCfg, completeAction) {
    return new Promise(async function (resolve, reject) {

        // Object Type
        const objType = require('@tinypudding/puddy-lib/get/objType');

        // Firebase Lib
        const databaseEscape = require('@tinypudding/firebase-lib/databaseEscape');
        const getDBData = require('@tinypudding/firebase-lib/getDBData');

        // App
        let app = null;

        // Exist Firebase
        if (objType(tinyCfg.firebase, 'object')) {

            // Debug
            if (tinyCfg.debug) {
                await logger.log('Using Firebase Config...');
                await logger.log(tinyCfg.firebase);
            }

            // New Firebase
            if (objType(tinyCfg.firebase.options, 'object')) {

                // Start Firebase
                const firebase = require('@tinypudding/firebase-lib');
                firebase.start(require('firebase-admin'), tinyCfg.firebase.options, tinyCfg.firebase.app);
                app = firebase.get(tinyCfg.firebase.options.id);

            }

            // Nope
            else { app = tinyCfg.firebase; }

        }


        // Exist App Firebase
        if (app) {

            // Bot Var
            const db = app.db.ref(tinyCfg.appPath).child(databaseEscape(req.query[tinyCfg.varNames.bot]));

            // Get Public Key
            getDBData(db.child('public_key')).then(async public_key => {

                // Debug
                if (tinyCfg.debug) { await logger.log('Bot Public Key was read...'); }

                // Get Client ID
                if (tinyCfg.getClientID) {
                    getDBData(db.child('client_id')).then(async client_id => {

                        // Debug
                        if (tinyCfg.debug) { await logger.log('Bot Client ID was read...'); }

                        // Complete
                        completeAction(client_id, public_key).then(() => {
                            resolve();
                            return;
                        }).catch(async err => {
                            await logger.error(err);
                            tinyCfg.errorCallback(req, res, 500, 'Action Error!');
                            reject(err);
                            return;
                        });
                        
                        return;

                    }).catch(async err => {
                        await logger.error(err);
                        tinyCfg.errorCallback(req, res, 404, 'Bot ID not found!');
                        reject(err);
                        return;
                    });
                }

                // Nope
                else { await completeAction(); resolve(); }

                // Complete
                return;

            }).catch(err => {
                tinyCfg.errorCallback(req, res, 404, 'Bot Public Key not found!');
                reject(err);
                return;
            });

        }

        // Get App Values
        else if (objType(tinyCfg.app, 'object') && objType(tinyCfg.app[req.query[tinyCfg.varNames.bot]], 'object')) {
            await completeAction(tinyCfg.app[req.query[tinyCfg.varNames.bot]].client_id, tinyCfg.app[req.query[tinyCfg.varNames.bot]].public_key);
            resolve();
        }

        // Nope
        else {
            tinyCfg.errorCallback(req, res, 404, 'App Data not found!');
            reject(new Error('App Data not found!'));
        }

        // Complete
        return;

    });
};