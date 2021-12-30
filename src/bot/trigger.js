const { ERROR, ERROR_MSG } = require("../exceptions.js");
const utils = require("./commands/youtube_utils.js");
const AudioPlayer = require("./commands/audioplayer.js");

class CommandTrigger {
    constructor() {
        this.m_audioPlayer = new AudioPlayer()
    }

    async triggerCommands(message, command, parameters) {
        try {
            switch(command) {
                case "play":
                    this.m_audioPlayer.play(message, parameters);
                    break;

                case "pause":
                    this.m_audioPlayer.pause();
                    break;
                
                case "resume":
                    this.m_audioPlayer.resume();
                    break;
                
                case "leave":
                    this.m_audioPlayer.leave();
                    break;
                
                case "next":
                    this.m_audioPlayer.next();
                    break;

                default:
                    throw new ERROR.CommandNotFoundException(ERROR_MSG.COMMAND_NOT_FOUND);
            }
        } catch(e) {
            console.log(e.message);
            throw e;
        }
    }
}

module.exports = CommandTrigger;