const SoundPlayer = require("./youtube_utils.js");
const { ERROR, ERROR_MSG } = require("../../exceptions.js");
const storage = require("../../storage/storage.js");

const SEARCH_LIMIT = 5;

class AudioPlayer {
    constructor() {
        this.m_connectionList = storage.cacheObject("Voice Connections");
    }

    async play(message, parameters) {
        try {
            if(parameters["s"] == undefined)
                throw new ERROR.CommandErrorException(ERROR_MSG.MISSING_ARGUMENT);

            const connection = this.$makeConnection(message);

            const info = await connection.play(parameters["s"], 0, SEARCH_LIMIT);
        } catch(e) {
            throw e;
        }
    }

    next(message) {
        if(this.m_connectionList.has(message.guild.id)) {
            this.m_connectionList.get(message.guild.id).stop();
            return;
        }

        throw new ERROR.CommandErrorException(ERROR_MSG.INVALID_VOICE_CONN);
    }

    pause(message) {
        if(this.m_connectionList.has(message.guild.id)) {
            this.m_connectionList.get(message.guild.id).pause();
            return;
        }

        throw new ERROR.CommandErrorException(ERROR_MSG.INVALID_VOICE_CONN);
    }

    resume(message) {
        if(this.m_connectionList.has(message.guild.id)) {
            this.m_connectionList.get(message.guild.id).resume();
            return;
        }

        throw new ERROR.CommandErrorException(ERROR_MSG.INVALID_VOICE_CONN);
    }

    leave(message) {
        if(this.m_connectionList.has(message.guild.id)) {
            this.m_connectionList.get(message.guild.id).leave();
            this.m_connectionList.delete(message.guild.id);
            return;
        }

        throw new ERROR.CommandErrorException(ERROR_MSG.INVALID_VOICE_CONN);
    }

    /* private */
    $makeConnection(message) {
        try {
            let connection = null;
            let current_channel = undefined;
            if(message.member.voice.channel)
                current_channel = message.member.voice.channel.id;
            else
                throw new ERROR.CommandErrorException(ERROR_MSG.VC_REQUIRED);

            if(this.m_connectionList.has(message.guild.id)) {
                const previous_connection = this.m_connectionList.get(message.guild.id);

                if(previous_connection.channel == current_channel) {
                    connection = previous_connection;
                    connection.stop();

                } else {
                    previous_connection.leave();

                    connection = SoundPlayer.join(message);
                    this.m_connectionList(message.guild.id, connection) = connection;
                }
            }

            if(!connection) {
                connection = SoundPlayer.join(message);
                this.m_connectionList.set(message.guild.id, connection);
            }

            return connection;
        } catch(e) {
            throw e;
        }
    }
}

module.exports = AudioPlayer;