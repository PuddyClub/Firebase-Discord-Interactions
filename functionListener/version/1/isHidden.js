module.exports = (data, interaction, getItem, tinyCfg) => {

    // Prepare Module
    const getValues = require('./getValues');

    // Hidden Checker
    const hiddenChecker = (getItem) => {

        // Boolean
        let isBoolean = false;

        // String
        if (typeof tinyCfg.hiddenDetector.value === "string") {

            // Check
            if (getItem.boolean(tinyCfg.hiddenDetector.value)) {
                isBoolean = true;
            }

        }

        // Array
        else if (Array.isArray(tinyCfg.hiddenDetector.value) && tinyCfg.hiddenDetector.value.length > 0) {
            for (const hvalue in tinyCfg.hiddenDetector.value) {

                // Check
                if (typeof tinyCfg.hiddenDetector.value[hvalue] === "string" && getItem.boolean(tinyCfg.hiddenDetector.value[hvalue])) {
                    isBoolean = true;
                    break;
                }

            }
        }

        // Complete
        if (isBoolean) { isHidden = true; }
        return;

    };

    const tryMoreHidden = (options) => {
        for (const item in options) {
            if (!isHidden) {
                if (options[item].options) { hiddenChecker(getValues.createFunctions({ data: options[item] }, tinyCfg.bot)); }
            } else { break; }
        }
        return;
    };

    // The Value
    let isHidden = false;

    // Base
    hiddenChecker(getItem);
    if (!isHidden && interaction.data.options) {
        tryMoreHidden(interaction.data.options);
    }

    // Is Hidden
    if (isHidden) {
        if (typeof data === "string") { data = { content: data, flags: 64 }; } else {
            data.data.flags = 64;
        }
    }

    // Complete
    return data;

};