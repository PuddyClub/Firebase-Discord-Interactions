module.exports = (data, interaction, getItem, tinyCfg) => {

    // Prepare Module
    const getValues = require('./getValues');

    // Hidden Checker
    const hiddenChecker = (item, getItem) => {

        // Description
        let isDescription = false;
        if (typeof item.description === "string") {

            // String
            if (typeof tinyCfg.hiddenDetector.icon === "string") {

                // Check
                if (item.description.indexOf(tinyCfg.hiddenDetector.icon) > -1) {
                    isDescription = true;
                }

            }

            // Array
            else if (Array.isArray(tinyCfg.hiddenDetector.icon) && tinyCfg.hiddenDetector.icon.length > 0) {
                for (const hvalue in tinyCfg.hiddenDetector.icon) {

                    // Check
                    if (typeof tinyCfg.hiddenDetector.icon[hvalue] === "string" && item.description.indexOf(tinyCfg.hiddenDetector.icon[hvalue]) > -1) {
                        isDescription = true;
                        break;
                    }

                }
            }

        }

        // Boolean
        let isBoolean = false;

        // Continue
        if (!isDescription) {

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

        }

        // Complete
        if (isDescription || isBoolean) { isHidden = true; }
        return;

    };

    const tryMoreHidden = (options) => {
        for (const item in options) {
            if (!isHidden) {
                if (options[item].options) { hiddenChecker(options[item], getValues.createFunctions({ data: options[item] }, tinyCfg.bot)); }
            } else { break; }
        }
        return;
    };

    // The Value
    let isHidden = false;

    // Base
    hiddenChecker(interaction.data, getItem);
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