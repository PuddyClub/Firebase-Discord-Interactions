module.exports = function (data, app, isTest = false) {

    // Prepare Modules
    const _ = require('lodash');
    const objType = require('@tinypudding/puddy-lib/get/objType');
    const clone = require('clone');
    const hash = require('object-hash');
    const forPromise = require('for-promise');

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

            // Key List
            const appKeys = { value: Object.keys(apps) };
            appKeys.length = appKeys.value.length;
            appKeys.count = appKeys.value.length;
            const extraList = [];

            // Delte Commands Script
            const deleteCommandsScript = function (commands, index, fn, fn_error) {

                /* Criar uma função que limpe todos os comandos do bot aqui. */
                console.log(commands[index]);

                // Complete
                fn();
                return;

            };

            // Read Apps
            await forPromise({ data: appKeys.length }, function (index, fn, fn_error, extra) {

                // Complete FN
                const complete_fn = function (client) {

                    // Remove Count
                    appKeys.count--;

                    // Complete Cicle
                    if (appKeys.count <= 0) {

                        // Run Extra List
                        if (extraList.length > 0) {
                            for (const item in extraList) {

                                // Command Manager
                                if (extraList[item].type !== "deleteAll") {

                                    // Extra Clear
                                    const deleteCommands = extraList[item].deleteCommands;
                                    let extraClear = null;
                                    let existClear = (Array.isArray(deleteCommands) && deleteCommands.length > 0);
                                    if (existClear) {
                                        extraClear = extra({ data: deleteCommands });
                                    }

                                    // Prepare Values
                                    const newCommands = extraList[item].commands;
                                    const guild_id = extraList[item].guild_id;
                                    const oldCommands = extraList[item].oldCommands;

                                    // Execute the extra for
                                    extraList[item].extra.run(function (index2, fn) {

                                        // Prepare Extra Clear
                                        const commandsFor = extra({ data: newCommands });
                                        commandsFor.run(function (index3, fn, fn_error) {

                                            // Execute Clear
                                            const executeClear = function () {

                                                // Delete Item
                                                const deleteItem = deleteCommands.findIndex(command => command.name === newCommand.name);
                                                if (deleteItem > -1) {
                                                    deleteCommands.splice(deleteItem, 1);
                                                }

                                                // Script
                                                if (existClear && index3 >= newCommands.length) {
                                                    extraClear.run(function (index4, fn, fn_error) { return deleteCommandsScript(deleteCommands, index4, fn, fn_error); });
                                                }

                                                // Complete
                                                fn();
                                                return;

                                            };

                                            // New Command
                                            const newCommand = newCommands[index3];

                                            // OLD Command
                                            const oldCommand = oldCommands.find(command => command.name === newCommand.name);

                                            // Get Command ID
                                            const commandID = newCommand.commandID;
                                            delete newCommand.commandID;

                                            // Set Editor Type to Create
                                            let editorType = 1;

                                            // Exist OLD Command
                                            if (oldCommand) {

                                                // Set Editor Type to Edit
                                                if (hash(oldCommand) !== hash(newCommand)) {
                                                    editorType = 2;
                                                }

                                                // Set Editor Type to Nothing
                                                else { editorType = 0; }

                                            }

                                            console.log(oldCommands);
                                            console.log(editorType);
                                            console.log(oldCommand);
                                            console.log(newCommand);

                                            // To do something
                                            if (editorType > 0) {

                                                const updateCommandDatabase = function (result) {
                                                    return new Promise(function (resolve, reject) {

                                                        // Set Command ID
                                                        app.db.ref(snapshot.ref.path.pieces_).child('commandID').set(result.id).then(() => {
                                                            resolve();
                                                            return;
                                                        }).catch(err => {
                                                            reject(err);
                                                            return;
                                                        });

                                                        // Complete
                                                        return;

                                                    });
                                                };

                                                // Create
                                                if (editorType === 1) {

                                                    // Global
                                                    if (typeof guild_id !== "string" && typeof guild_id !== "number") {
                                                        client.createCommand(newCommand).then(result => {
                                                            updateCommandDatabase(result).then(() => {
                                                                executeClear();
                                                                return;
                                                            }).catch(err => {
                                                                logger.error(err);
                                                                executeClear();
                                                                return;
                                                            });
                                                            return;
                                                        }).catch(err => {
                                                            logger.error(err);
                                                            executeClear();
                                                            return;
                                                        });
                                                    }

                                                    // Guild
                                                    else {
                                                        client.createCommand(newCommand, guild_id).then(result => {
                                                            updateCommandDatabase(result).then(() => {
                                                                executeClear();
                                                                return;
                                                            }).catch(err => {
                                                                logger.error(err);
                                                                executeClear();
                                                                return;
                                                            });
                                                        }).catch(err => {
                                                            logger.error(err);
                                                            executeClear();
                                                            return;
                                                        });
                                                    }

                                                }

                                                // Edit
                                                else if (editorType === 2) {

                                                    // Global
                                                    if (typeof guild_id !== "string" && typeof guild_id !== "number") {
                                                        client.editCommand(newCommand, commandID).then(result => {
                                                            updateCommandDatabase(result).then(() => {
                                                                executeClear();
                                                                return;
                                                            }).catch(err => {
                                                                logger.error(err);
                                                                executeClear();
                                                                return;
                                                            });
                                                        }).catch(err => {
                                                            logger.error(err);
                                                            executeClear();
                                                            return;
                                                        });
                                                    }

                                                    // Guild
                                                    else {
                                                        client.editCommand(newCommand, commandID, guild_id).then(result => {
                                                            updateCommandDatabase(result).then(() => {
                                                                executeClear();
                                                                return;
                                                            }).catch(err => {
                                                                logger.error(err);
                                                                executeClear();
                                                                return;
                                                            });
                                                        }).catch(err => {
                                                            logger.error(err);
                                                            executeClear();
                                                            return;
                                                        });
                                                    }

                                                }

                                            }

                                            // Nope
                                            else { executeClear(); }

                                            // Complete
                                            return;

                                        });

                                        // Complete
                                        fn();
                                        return;

                                    });

                                }

                                // Delete All
                                else {
                                    const deleteCommands = extraList[item].deleteCommands;
                                    extraList[item].extra.run(function (index2, fn, fn_error) { return deleteCommandsScript(deleteCommands, index2, fn, fn_error); });
                                }

                            }
                        }

                        // Nope
                        else { fn(true); }

                    }

                    return;

                };

                // Read Token
                getDBData(db.child(appKeys.value[index]).child('token')).then(token => {

                    // Is a Token String
                    if (typeof token === "string") {

                        // App
                        const app = apps[appKeys.value[index]];

                        // Create Client
                        const client = new interactionsClient({
                            client_id: app.client_id,
                            bot_token: token
                        });

                        // Get Commands
                        const getCommands = function (oldCommands, guildID) {

                            // Is Array
                            if (Array.isArray(oldCommands)) {

                                // Delete List
                                const deleteCommands = clone(oldCommands);

                                // Exist Commands
                                let existCommands = false;

                                // Exist Global Commands
                                if (typeof guildID !== "string") {
                                    existCommands = true;
                                    extraList.push({
                                        type: 'global',
                                        commands: app.commands.global,
                                        deleteCommands: deleteCommands,
                                        oldCommands: oldCommands,
                                        extra: extra({ data: app.commands.global })
                                    });
                                }

                                // Exist Private Guild Commands
                                else {
                                    existCommands = true;
                                    extraList.push({
                                        type: 'guild',
                                        guild_id: guildID,
                                        root: app,
                                        commands: app.commands.guilds[guildID],
                                        oldCommands: oldCommands,
                                        deleteCommands: deleteCommands,
                                        extra: extra({ data: app.commands.guilds[guildID] })
                                    });
                                }

                                // No Commands
                                if (!existCommands) {
                                    extraList.push({
                                        type: 'deleteAll',
                                        root: app,
                                        deleteCommands: deleteCommands,
                                        oldCommands: oldCommands,
                                        extra: extra({ data: deleteCommands })
                                    });
                                }

                            }

                            // Complete
                            complete_fn(client); return;

                        };

                        // Exist Command List
                        if (objType(app.commands, 'object')) {

                            // Global
                            if (Array.isArray(app.commands.global)) {

                                // list all your existing commands.
                                client.getCommands().then(oldCommands => {
                                    return getCommands(oldCommands);
                                }).catch(err => {
                                    logger.error(err); complete_fn(client); return;
                                });

                            }

                            // Guilds
                            if (objType(app.commands.guilds, 'object')) {
                                for (const item in app.commands.guilds) {
                                    if (Array.isArray(app.commands.guilds[item])) {

                                        // list all your existing commands.
                                        client.getCommands({ guildID: item }).then(oldCommands => {
                                            return getCommands(oldCommands, item);
                                        }).catch(err => {
                                            logger.error(err); complete_fn(client); return;
                                        });

                                    }
                                }
                            }

                        }

                        // Nope
                        else { complete_fn(client); }

                    }

                    // Nope
                    else { complete_fn(); }

                    // Complete
                    return;

                }).catch(err => {
                    logger.error(err); complete_fn(); return;
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