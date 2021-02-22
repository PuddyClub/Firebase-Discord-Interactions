// Module
const discord_interaction = require('../database');
const firebase = require('@tinypudding/firebase-lib');

// Prepare Firebase
const tinyCfg = require('../../test/config.json');

// Get Credentials
const admin = require('firebase-admin');
tinyCfg.firebase.credential = admin.credential.cert(require('../../test/firebase.json'));

// Start Firebase
firebase.start(admin, tinyCfg.options, tinyCfg.firebase);

// App
app = firebase.get(tinyCfg.options.id);

// Start Test App
discord_interaction(tinyCfg.test_app, app, () => {
    console.log('Complete');
    return;
});