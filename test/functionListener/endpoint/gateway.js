// Tiny Config
const tinyCfg = require('../../config.json');

// Module
require('../../../functionListener/gateway')(tinyCfg, tinyCfg.gateway_test_token);