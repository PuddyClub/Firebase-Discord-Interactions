module.exports = {

    // Database
    database: require('./database'),

    // Templates
    templates: require('./templates'),

    // Gateway Simulator
    gatewaySimulator: require('./functionListener/gateway'),

    // Function Listener
    functionListener: require('./functionListener')

};