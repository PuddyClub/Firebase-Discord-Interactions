module.exports = {

    // Database
    database: require('./database'),

    // Gateway Simulator
    gatewaySimulator: {

        // V1
        v1: require('./functionListener/version/gateway_v1')

    },

    // Function Listener
    functionListener: require('./functionListener')

};