const SoundPlayer = require("./youtube_utils.js");
const { ERROR, ERROR_MSG } = require("../../exceptions.js");
const storage = require("../../storage/storage.js");
const writer = require("../writer.js");

const SEARCH_LIMIT = 5;

class AudioPlayer {
    constructor() {
        this.m_connectionList = storage.cacheObject("Voice Connections");
        this.m_queueList = storage.cacheObject("Audio Queue");
    }

    async play(message, parameters) {
        try {
            if(parameters["s"] == undefined)
                throw new ERROR.CommandErrorException(ERROR_MSG.MISSING_ARGUMENT);

            let info = undefined;

            if(this.m_queueList.has(message.guild.id)) {

                const youtube_results = await SoundPlayer.searchYoutube(parameters["s"], SEARCH_LIMIT);
                info = youtube_results[0];
                this.m_queueList.get(message.guild.id).push(info);

            } else {

                const connection = await this.$makeConnection(message);
                info = await connection.play(parameters["s"], 0, SEARCH_LIMIT);

                const new_queue_list = new storage.JSONArray(info);
                this.m_queueList.set(message.guild.id, new_queue_list);

            }

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
        this.$isPlayingAudio(message);

        const info = this.m_queueList.get(message.guild.id)[0];
        writer.writeMessage(message, {
            title: "This audio will be skipped!",
            subtitle: info.title,
            message: info.author + " - " + info.time,
            url: info.url
        });

        this.m_connectionList.get(message.guild.id).stop();
    }

    pause(message) {
        this.$isPlayingAudio(message);

        const info = this.m_queueList.get(message.guild.id)[0];
        writer.writeMessage(message, {
            title: "This audio will be paused!",
            subtitle: info.title,
            message: info.author + " - " + info.time,
            url: info.url
        });

        this.m_connectionList.get(message.guild.id).pause();
    }

    resume(message) {
        this.$isPlayingAudio(message);

        const info = this.m_queueList.get(message.guild.id)[0];
        writer.writeMessage(message, {
            title: "The audio will be resumed!",
            subtitle: info.title,
            message: info.author + " - " + info.time,
            url: info.url
        });

        this.m_connectionList.get(message.guild.id).resume();
    }

    leave(message) {
        if(!this.m_connectionList.has(message.guild.id))
            throw new ERROR.CommandErrorException(ERROR_MSG.INVALID_VOICE_CONN);

        this.m_connectionList.get(message.guild.id).leave();
        this.m_connectionList.delete(message.guild.id);

        this.m_queueList.delete(message.guild.id);

        writer.writeMessage(message, {
            title: "The bot has left the voice channel!",
            subtitle: "The audio queue will be removed!",
            message: "Use the \"play\" command to have the bot join the voice channel again!"
        });
    }

    displayQueue(message) {
        if(!this.m_queueList.has(message.guild.id)) {
            writer.writeMessage(message, {
                title: "Audio Queue",
                subtitle: "The Queue is empty at the moment!",
                message: "Use the play command to add audios to the queue!"
            });
            return;
        }

        const queue_list = this.m_queueList.get(message.guild.id);

        const embed = writer.createEmbed("Audio Queue");

        for(let i=0;i<queue_list.length;i++) {
            const info = queue_list[i];
            const description = (i + 1) + ". " + info.author + " - " + info.time + "\n" + info.url;
            embed.addField(info.title, description);
        }

        writer.sendMessage(message, embed);
    }

    /* private */
    async $makeConnection(message) {
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
            async (connection) => { await this.$onAudioIdleCallback(message, connection) }
        );
        this.m_connectionList.set(message.guild.id, connection);

        return connection;
    }

    async $onAudioIdleCallback(message, connection) {
        if(message.member.voice.channel.members.size == 1)
            this.leave();
        
        this.m_queueList.get(message.guild.id).delete(0);
        if(this.m_queueList.get(message.guild.id).length > 0) {

            try {

                const info_block = this.m_queueList.get(message.guild.id)[0];
                await connection.searchUrlAndPlay(info_block.url);

            } catch(e) {
                throw e;
            }

        } else {
            //not sure if the bot should leave or stay
            this.leave(message);
        }
    }

    $isPlayingAudio(message) {
        if(!this.m_connectionList.has(message.guild.id))
            throw new ERROR.CommandErrorException(ERROR_MSG.INVALID_VOICE_CONN);
        
        if(!this.m_queueList.has(message.guild.id))
            throw new ERROR.CommandErrorException(ERROR_MSG.NO_VOICE);
    }

    $connectionForceDisconnect(guildId) {
        this.m_connectionList.delete(guildId);
    }
}

module.exports = AudioPlayer;