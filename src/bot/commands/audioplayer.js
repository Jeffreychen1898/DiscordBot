const SoundPlayer = require("./youtube_utils.js");
const { ERROR, ERROR_MSG } = require("../../exceptions.js");
const storage = require("../../storage/storage.js");
const writer = require("../writer.js");

/*
queue data:
    Title
    Author
    URL
    Timestamp
*/
const SEARCH_LIMIT = 5;

class AudioPlayer {
    constructor() {
        this.m_connectionList = storage.cacheObject("Voice Connections");
    }

    async play(message, parameters) {
        try {
            if(parameters["s"] == undefined)
                throw new ERROR.CommandErrorException(ERROR_MSG.MISSING_ARGUMENT);

            /*
            if queue is not empty
                push song to queue
                return
            */
            const connection = this.$makeConnection(message);

            const info = await connection.play(parameters["s"], 0, SEARCH_LIMIT);
            /*
            push song to queue
            */

            const output_message = {
                title: info.title,
                subtitle: info.author + " - " + info.time,
                message: info.url,
                thumbnail: info.thumbnail,
                url: info.url
            };
            writer.writeMessage(message, output_message);
        } catch(e) {
            throw e;
        }
    }

    next(message) {
        if(this.m_connectionList.has(message.guild.id)) {
            this.m_connectionList.get(message.guild.id).stop();
            writer.writeMessage(message, {
                title: "The current song is stopped!",
                message: "The next song will play if the queue is not empty!"
            });
            return;
        }

        throw new ERROR.CommandErrorException(ERROR_MSG.INVALID_VOICE_CONN);
    }

    pause(message) {
        if(this.m_connectionList.has(message.guild.id)) {
            this.m_connectionList.get(message.guild.id).pause();
            writer.writeMessage(message, {
                title: "The current song is paused!",
                message: "Use the \"resume\" command to resume the song!"
            });
            return;
        }

        throw new ERROR.CommandErrorException(ERROR_MSG.INVALID_VOICE_CONN);
    }

    resume(message) {
        if(this.m_connectionList.has(message.guild.id)) {
            this.m_connectionList.get(message.guild.id).resume();
            writer.writeMessage(message, {
                title: "The current song is resumed!",
                message: "Use the \"pause\" command to pause the song again!"
            });
            return;
        }

        throw new ERROR.CommandErrorException(ERROR_MSG.INVALID_VOICE_CONN);
    }

    leave(message) {
        if(this.m_connectionList.has(message.guild.id)) {
            this.m_connectionList.get(message.guild.id).leave();
            this.m_connectionList.delete(message.guild.id);
            /*
            remove queue
            */
            writer.writeMessage(message, {
                title: "The bot has left the voice channel!",
                message: "Use the \"play\" command to have the bot join the voice channel again!"
            });
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
                    connection = this.$joinVoiceChannel(message);
                }
            }

            if(!connection)
                connection = this.$joinVoiceChannel(message);

            return connection;
        } catch(e) {
            throw e;
        }
    }

    $joinVoiceChannel(message) {
        const connection = SoundPlayer.join(
            message,
            (guildId) => { this.$connectionForceDisconnect(guildId) },
            () => { this.$onAudioIdleCallback() }
        );
        this.m_connectionList.set(message.guild.id, connection);

        return connection;
    }

    $onAudioIdleCallback() {
        /*
        if member count in vc is 1
            leave

        pop the song from queue
        if queue is not empty
            play next song
        else
            //
        */
        console.log("hello world");
    }

    $connectionForceDisconnect(guildId) {
        this.m_connectionList.delete(guildId);
    }
}

module.exports = AudioPlayer;