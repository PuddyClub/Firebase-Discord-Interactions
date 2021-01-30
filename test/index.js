// Module
const discord_interaction = require('../index');
const firebase = require('@tinypudding/firebase-lib');

// Prepare Firebase
const tinyCfg = require('./config.json');

// Get Credentials
const admin = require('firebase-admin');
tinyCfg.firebase.credential = admin.credential.cert(require('./firebase.json'));

// Start Firebase
firebase.start(admin, tinyCfg.options, tinyCfg.firebase);

// App
app = firebase.get(tinyCfg.options.id);

// Start Test App
discord_interaction(tinyCfg.test_app, app, true);