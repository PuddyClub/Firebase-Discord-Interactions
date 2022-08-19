module.exports = (tinyCfg, logger, req, res) => {
    return (msg) => {
        return new Promise(async (resolve, reject) => {

            // Prepare Result
            const result = { type: 9, data: msg };

            // Debug
            if (tinyCfg.debug) { await logger.log('Sending modal...'); }
            if (tinyCfg.debug) { await logger.log(result); }

            // Custom Result
            if (urlResult.custom_result) {
                urlResult.custom_result(result).then(data => { resolve(data); }).catch(err => { reject(err); });
            }

            // Normal JSON
            else if (!req.isGateway) {
                resolve(); res.json(result);
            }

            // Nope
            else {
                res.json(result).then(async (data) => { resolve(data); return; }).catch(async (err) => { reject(err); return; });
            }

            // Complete
            return;

        });
    };
};