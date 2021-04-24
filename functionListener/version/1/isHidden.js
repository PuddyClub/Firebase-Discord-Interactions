module.exports = (data, interaction, getItem, tinyCfg) => {

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

                }
            }

        }

        // Boolean
        let isBoolean = false;
        if (typeof tinyCfg.hiddenDetector.value === "stirng") {

            // Check
            if (getItem.boolean()) {
                isBoolean = true;
            }

        }

        // Array
        else if (Array.isArray(tinyCfg.hiddenDetector.value) && tinyCfg.hiddenDetector.value.length > 0) {
            for (const hvalue in tinyCfg.hiddenDetector.value) {

            }
        }


        // Complete
        if (isDescription || isBoolean) { return true; } else { return false; }

    };

    const tryMoreHidden = (options) => {
        for (const item in options) {
            if (!isHidden) { isHidden = hiddenChecker(options[item].options, getValues.createFunctions({ data: options[item] }, tinyCfg.bot)); } else { return true; }
        }
        return false;
    };

    // The Value
    let isHidden = false;

    // Base
    isHidden = hiddenChecker(interaction.data, getItem);
    if (!isHidden && interaction.data.options) {
        isHidden = tryMoreHidden(interaction.data.options);
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