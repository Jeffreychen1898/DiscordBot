const { ERROR, ERROR_MSG } = require("../exceptions.js");
const utils = require("./commands/youtube_utils.js");
const AudioPlayer = require("./commands/audioplayer.js");

class CommandTrigger {
    constructor() {
        this.m_audioPlayer = new AudioPlayer()
    }

    async triggerCommands(message, command, parameters) {
        try {

            if(command == "play")
                await this.m_audioPlayer.play(message, parameters);

            else if(command == "pause")
                this.m_audioPlayer.pause(message);

            else if(command == "resume")
                this.m_audioPlayer.resume(message);

            else if(command == "leave")
                this.m_audioPlayer.leave(message);

            else if(command == "next")
                this.m_audioPlayer.next(message);

            else
                throw new ERROR.CommandNotFoundException(ERROR_MSG.COMMAND_NOT_FOUND);

        } catch(e) {
            throw e;
        }
    }
}

module.exports = CommandTrigger;