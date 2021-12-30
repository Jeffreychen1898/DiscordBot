const SoundPlayer = require("./youtube_utils.js");
const { ERROR, ERROR_MSG } = require("../../exceptions.js");

const SEARCH_LIMIT = 5;

class AudioPlayer {
    constructor() {
        this.m_soundPlayer = new SoundPlayer(SEARCH_LIMIT);
    }

    async play(message, parameters) {
        if(parameters["s"] == undefined)
            throw new ERROR.CommandErrorException(ERROR_MSG.MISSING_ARGUMENT);
        
        this.m_soundPlayer.join(message);
        await this.m_soundPlayer.play(parameters["s"], 0);
    }

    next() {
        this.m_soundPlayer.stop();
    }

    pause() {
        this.m_soundPlayer.pause();
    }

    resume() {
        this.m_soundPlayer.resume();
    }

    leave() {
        this.m_soundPlayer.leave();
    }
}

module.exports = AudioPlayer;