const { ERROR, ERROR_MSG } = require("../exceptions.js");

class CommandTrigger {
    constructor() {
        //
    }

    async triggerCommands(message, command, parameters) {
        try {

            throw new ERROR.CommandNotFoundException(ERROR_MSG.COMMAND_NOT_FOUND);

        } catch(e) {
            throw e;
        }
    }
}

module.exports = CommandTrigger;