const { ERROR, ERROR_MSG } = require("../exceptions.js");
const utils = require("./commands/youtube_utils.js");

class CommandTrigger {
    constructor() {
        //
    }

    async triggerCommands(message, command, parameters) {
        console.log(await utils("rickroll"));
        try {

            throw new ERROR.CommandNotFoundException(ERROR_MSG.COMMAND_NOT_FOUND);

        } catch(e) {
            throw e;
        }
    }
}

module.exports = CommandTrigger;