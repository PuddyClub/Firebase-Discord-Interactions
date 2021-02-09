module.exports = {

    // Database
    database: function () { throw new Error('This module was deprecated! The deprecated file is /deprecated/database'); },

    // Templates
    templates: require('./templates'),

    // Gateway Simulator
    gatewaySimulator: require('./functionListener/gateway'),

    // Function Listener
    functionListener: require('./functionListener')

};