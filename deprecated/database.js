module.exports = function (data, app, isTest = false) {

    // Prepare Modules
    const _ = require('lodash');
    const objType = require('@tinypudding/puddy-lib/get/objType');
    const clone = require('clone');
    const hash = require('object-hash');
    const forPromise = require('for-promise');

    // Logger
    let logger = null;
    try {
        logger = require('@tinypudding/firebase-lib/logger');
    } catch (err) {
        logger = console;
    }

    // Create Settings
    const tinyCfg = _.defaultsDeep({}, data, {
        appPath: '/',
        botPath: '/',
        database: '',
        timeout: 5
    });

    // Script Base
    const discordCommandChecker = (snapshot) => {
        return new Promise(function (resolve) {

            // Prepare Data
            const apps = snapshot.val();

            // Exist Data
            if (objType(apps, 'object')) {

                // Prepare Moment
                const moment = require('moment-timezone');

                // App DB
                const appDB = app.db.ref(snapshot.ref.path.pieces_.join('/'));

                // Prepare Timeout
                const timeoutData = {
                    now: moment.tz('Universal'),
                    old: moment.tz(apps.timeout, 'Universal')
                };

                if (timeoutData.old.isValid()) {
                    timeoutData.left = timeoutData.old.diff(timeoutData.now, 'seconds');
                } else {
                    timeoutData.left = 0;
                }

                if (timeoutData.left < 1) {
                    appDB.child('timeout').set(timeoutData.now.add(tinyCfg.timeout, 'seconds').format()).then(async () => {

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
                        const deleteCommandsScript = function (client_id, guild_id, client, commands, dontDelete, fn, fn_error, extra) {

                            // Run Delete Commands
                            console.log('delete command');
                            console.log(commands);
                            console.log(dontDelete);
                            const deleteCommands = extra({ data: commands });
                            deleteCommands.run(function (index, fn) {

                                // Check If can delete
                                let canDelete = true;
                                if (Array.isArray(dontDelete) && dontDelete.length > 0) {
                                    for (const item in dontDelete) {
                                        if (commands.find(command => command.name === dontDelete[item].name)) {
                                            canDelete = false;
                                            break;
                                        }
                                    }
                                }

                                // Delte
                                if (canDelete) {

                                    // Logger Info
                                    logger.log(`OLD command deleted from the app ${client_id}!`, commands[index]);

                                    // Global
                                    if (typeof guild_id !== "string") {
                                        client.deleteCommand(commands[index].id).then(() => {
                                            fn();
                                            return;
                                        }).catch(err => {
                                            fn();
                                            return;
                                        });
                                    }

                                    // Guild
                                    else {
                                        client.deleteCommand(commands[index].id, guild_id).then(() => {
                                            fn();
                                            return;
                                        }).catch(err => {
                                            fn();
                                            return;
                                        });
                                    }

                                }

                                // Complete
                                return;

                            });

                            // Complete
                            fn();
                            return;

                        };

                        // Read Apps
                        await forPromise({ data: appKeys.length }, function (index, fn, fn_error, extra) {

                            // Complete Count
                            let complete_count = 0;

                            // Complete FN
                            const complete_fn = function (client, forceComplete = false) {

                                // Verify Complete
                                if (complete_count <= 0 || forceComplete) {

                                    // Remove Count
                                    appKeys.count--;

                                    // Complete Cicle
                                    if (appKeys.count <= 0) {

                                        // Run Extra List
                                        if (extraList.length > 0) {
                                            for (const item in extraList) {

                                                // Prepare Clear
                                                const deleteCommands = extraList[item].deleteCommands;
                                                const client_id = extraList[item].client_id;
                                                const guild_id = extraList[item].guild_id;
                                                const appName = extraList[item].appName;

                                                // Command Manager
                                                if (extraList[item].type !== "deleteAll") {

                                                    // Extra Clear                        
                                                    const dontDelete = [];
                                                    let extraClear = null;
                                                    let existClear = (Array.isArray(deleteCommands) && deleteCommands.length > 0);
                                                    if (existClear) {
                                                        extraClear = extra({ data: deleteCommands });
                                                    }

                                                    // Prepare Values
                                                    const newCommands = extraList[item].commands;
                                                    const newCommandsCount = newCommands.length - 1;
                                                    const oldCommands = extraList[item].oldCommands;

                                                    // Execute the extra for
                                                    extraList[item].extra.run(function (index2, fn) {

                                                        // Prepare Extra Clear
                                                        const commandsFor = extra({ data: newCommands });
                                                        commandsFor.run(function (index3, fn) {

                                                            // Execute Clear
                                                            const executeClear = function () {

                                                                // Delete Item
                                                                dontDelete.push(newCommand);

                                                                // Script
                                                                if (existClear && index3 >= newCommandsCount) {
                                                                    extraClear.run(function (index4, fn, fn_error) { return deleteCommandsScript(client_id, guild_id, client, deleteCommands, dontDelete, fn, fn_error, extra); });
                                                                }

                                                                // Complete
                                                                fn();
                                                                return;

                                                            };

                                                            // New Command
                                                            const newCommand = clone(newCommands[index3]);

                                                            // OLD Command
                                                            const oldCommand = clone(oldCommands.find(command => command.name === newCommand.name));

                                                            // Get Command ID
                                                            const commandID = newCommand.commandID;
                                                            delete newCommand.commandID;

                                                            // Set Editor Type to Create
                                                            let editorType = 1;

                                                            // Exist OLD Command
                                                            if (oldCommand) {

                                                                // Remove OLD Data

                                                                // Prepare Clear
                                                                for (const option in oldCommand) {
                                                                    if (option !== "id" && option !== "name" && option !== "description" && option !== "options") {
                                                                        delete oldCommand[option];
                                                                    }
                                                                }

                                                                // Set Editor Type to Edit
                                                                if (hash(newCommand) !== hash(oldCommand)) {
                                                                    editorType = 2;
                                                                }

                                                                // Set Editor Type to Nothing
                                                                else { editorType = 0; }

                                                            }

                                                            // To do something
                                                            if (editorType > 0) {

                                                                // Final Result
                                                                const final_result = {
                                                                    then: result => {
                                                                        updateCommandDatabase(result).then(() => {
                                                                            executeClear();
                                                                            return;
                                                                        }).catch(err => {
                                                                            logger.error(err);
                                                                            executeClear();
                                                                            return;
                                                                        });
                                                                        return;
                                                                    },
                                                                    catch: err => {
                                                                        logger.error(err);
                                                                        removeCommandDatabase().then(() => {
                                                                            executeClear();
                                                                            return;
                                                                        }).catch(err => {
                                                                            logger.error(err);
                                                                            executeClear();
                                                                            return;
                                                                        });
                                                                        return;
                                                                    }
                                                                };

                                                                // Get Database Command
                                                                const getCommandDatabase = function () {

                                                                    // Global
                                                                    if (typeof guild_id !== "string") { return appDB.child(appName).child('commands').child('global').child(index3); }

                                                                    // Guild
                                                                    else { return appDB.child(appName).child('commands').child('guilds').child(guild_id).child(index3); }

                                                                };

                                                                // Update Command Database
                                                                const updateCommandDatabase = function (result) {
                                                                    return new Promise(function (resolve, reject) {

                                                                        // Set Command ID
                                                                        if (typeof result.id === "string" || typeof result.id === "number") {

                                                                            // Set Command ID
                                                                            getCommandDatabase().child('commandID').set(result.id).then(() => {
                                                                                resolve();
                                                                                return;
                                                                            }).catch(err => {
                                                                                reject(err);
                                                                                return;
                                                                            });

                                                                        }

                                                                        // Nope
                                                                        else { resolve(); }

                                                                        // Complete
                                                                        return;

                                                                    });
                                                                };

                                                                // Remove Command Database
                                                                const removeCommandDatabase = function () {
                                                                    return new Promise(function (resolve, reject) {

                                                                        // Remove Command
                                                                        getCommandDatabase().remove().then(() => {
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

                                                                    // Logger Info
                                                                    logger.log(`New command added to the app ${client_id}!`, newCommand);

                                                                    // Global
                                                                    if (typeof guild_id !== "string" && typeof guild_id !== "number") {
                                                                        client.createCommand(newCommand).then(final_result.then).catch(final_result.catch);
                                                                    }

                                                                    // Guild
                                                                    else {
                                                                        client.createCommand(newCommand, guild_id).then(final_result.then).catch(final_result.catch);
                                                                    }

                                                                }

                                                                // Edit
                                                                else if (editorType === 2) {

                                                                    // Logger Info
                                                                    logger.log(`New command edited to the app ${client_id}!`, newCommand);

                                                                    // Global
                                                                    if (typeof guild_id !== "string" && typeof guild_id !== "number") {
                                                                        if (typeof commandID === "string") {
                                                                            client.editCommand(newCommand, commandID).then(final_result.then).catch(final_result.catch);
                                                                        } else {
                                                                            client.createCommand(newCommand).then(final_result.then).catch(final_result.catch);
                                                                        }
                                                                    }

                                                                    // Guild
                                                                    else {
                                                                        if (typeof commandID === "string") {
                                                                            client.editCommand(newCommand, commandID, guild_id).then(final_result.then).catch(final_result.catch);
                                                                        } else {
                                                                            client.createCommand(newCommand, guild_id).then(final_result.then).catch(final_result.catch);
                                                                        }
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
                                                    extraList[item].extra.run(function (index2, fn, fn_error) { return deleteCommandsScript(client_id, guild_id, client, deleteCommands, null, fn, fn_error, extra); });
                                                }

                                            }
                                        }

                                        // Nope
                                        else { fn(true); }

                                    }

                                }

                                // Nope
                                else { complete_count--; }

                                return;

                            };

                            // Read Token
                            if (appKeys.value[index] !== "timeout") {
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
                                            console.log('OLD COmmands');
                                            console.log(oldCommands);
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
                                                        appName: appKeys.value[index],
                                                        client_id: app.client_id,
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
                                                        appName: appKeys.value[index],
                                                        client_id: app.client_id,
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
                                                        appName: appKeys.value[index],
                                                        client_id: app.client_id,
                                                        root: app,
                                                        deleteCommands: deleteCommands,
                                                        oldCommands: oldCommands,
                                                        extra: extra({ data: deleteCommands })
                                                    });
                                                }

                                            }

                                            // Remove Count
                                            complete_count--;

                                            // Complete
                                            complete_fn(client); return;

                                        };

                                        // Exist Command List
                                        if (objType(app.commands, 'object')) {

                                            // Commands Loaded
                                            let commandsLoaded = false;

                                            // Guilds
                                            if (objType(app.commands.guilds, 'object')) {
                                                for (const item in app.commands.guilds) {
                                                    if (Array.isArray(app.commands.guilds[item])) {

                                                        // Complete Count
                                                        complete_count++;

                                                        // list all your existing commands.
                                                        commandsLoaded = true;
                                                        client.getCommands({ guildID: item }).then(oldCommands => {
                                                            return getCommands(oldCommands, item);
                                                        }).catch(err => {
                                                            complete_count--;
                                                            logger.error(err); complete_fn(client); return;
                                                        });

                                                    }
                                                }
                                            }

                                            // Global
                                            if (Array.isArray(app.commands.global)) {

                                                // list all your existing commands.
                                                complete_count++;
                                                commandsLoaded = true;
                                                client.getCommands().then(oldCommands => {
                                                    return getCommands(oldCommands);
                                                }).catch(err => {
                                                    complete_count--;
                                                    logger.error(err); complete_fn(client); return;
                                                });

                                            }

                                            // Commands not loaded
                                            if (!commandsLoaded) { complete_fn(null, true); }

                                        }

                                        // Nope
                                        else { complete_fn(null, true); }

                                    }

                                    // Nope
                                    else { complete_fn(null, true); }

                                    // Complete
                                    return;

                                }).catch(err => {
                                    logger.error(err); complete_fn(null, true); return;
                                });
                            }

                            // Nope
                            else { complete_fn(null, true); }

                            // Complete
                            return;

                        });

                        // Complete
                        resolve();
                        return;

                    }).catch(err => {
                        logger.error(err);
                        resolve();
                        return;
                    });
                } else { resolve(); }

            } else { resolve(); }

            // Complete
            return;

        });
    };

    // Production
    if (!isTest) {
        return discordCommandChecker;
    }

    // Test Mode
    else {

        try {

            // Prepare Test DB
            const db = app.db.ref(tinyCfg.appPath);

            // Insert Value
            db.on("value", function (snapshot) {
                discordCommandChecker(snapshot).then(() => {
                    if (typeof isTest === 'function') { isTest(); }
                    return;
                });
            });

        } catch (err) {
            logger.error(err);
        }

        // Complete
        return;

    }

};