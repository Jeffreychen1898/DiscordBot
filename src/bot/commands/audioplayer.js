const SoundPlayer = require("./youtube_utils.js");
const { ERROR, ERROR_MSG } = require("../../exceptions.js");
const storage = require("../../storage/storage.js");
const writer = require("../writer.js");

const SEARCH_LIMIT = 5;

class AudioPlayer {
    constructor() {
        this.m_connectionList = storage.cacheObject("Voice Connections");
        this.m_queueList = storage.cacheObject("Audio Queue");
        this.m_loopQueue = storage.cacheObject("Loop Queue");
    }

    async trigger(message, command, parameters, content) {
        if(command[1] == "play")
            await this.playAudio(message, content);

        else if(command[1] == "pause")
            await this.pause(message);

        else if(command[1] == "resume")
            await this.resume(message);

        else if(command[1] == "leave")
            await this.leave(message);

        else if(command[1] == "next")
            await this.next(message);

        else if(command[1] == "queue")
            await this.displayQueue(message);

        else if(command[1] == "loop")
            await this.loop(message, command.slice(2));

        else if(command[1] == "unloop")
            await this.unloop(message);

        else if(command[1] == "current")
            await this.showCurrent(message);

        else
            throw new ERROR.CommandNotFoundException(ERROR_MSG.COMMAND_NOT_FOUND);
    }

    async playAudio(message, search) {
        if(search.length == 0)
            search = undefined;
        
        await this.$play(message, search);
    }

    async simplePlay(message, content) {
        if(content == "")
            throw new ERROR.CommandErrorException(ERROR_MSG.MISSING_ARGUMENT);
        
        await this.$play(message, content);
    }

    loop(message, parameters) {
        if(!this.m_queueList.has(message.guild.id))
            throw new ERROR.CommandErrorException(ERROR_MSG.NO_VOICE);

        let randomize = false;
        for(const param of parameters) {
            if(param == "random")
                randomize = true;
        }

        this.m_loopQueue.set(message.guild.id, {
            random: randomize,
            list: [...this.m_queueList.get(message.guild.id)]
        });

        const not_random_message = "If you want to randomize the order everytime the queue is looped, add in a parameter called \"random\"!";
        const on_random_message = "The queue will be randomized everytime it is looped!"
        writer.writeMessage(message, {
            title: "The queue will be looped!",
            subtitle: `Use the "${process.env.PREFIX}unloop" command to remove this loop!`,
            message: (randomize)?on_random_message:not_random_message
        });
    }

    unloop(message) {
        this.m_loopQueue.delete(message.guild.id);

        writer.writeMessage(message, {
            title: "The queue will no longer be looped!",
            subtitle: `Use the "${process.env.PREFIX}loop" command to loop the queue again`,
            message: writer.BLANK
        });
    }

    showCurrent(message) {
        if(!this.m_queueList.has(message.guild.id))
            throw new ERROR.CommandErrorException(ERROR_MSG.NO_VOICE);
        
        const info = this.m_queueList.get(message.guild.id)[0];

        writer.writeMessage(message, {
            title: "This audio is currently playing!",
            subtitle: info.title,
            thumbnail: info.thumbnail,
            url: info.url,
            message: [
                info.author + " - " + info.time,
                info.url
            ]
        });
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
        this.$connectionForceDisconnect(message.guild.id);

        writer.writeMessage(message, {
            title: "The bot has left the voice channel!",
            subtitle: "The audio queue will be removed!",
            message: `Use the "${process.env.PREFIX}play" command to have the bot join the voice channel again!`
        });
    }

    displayQueue(message) {
        if(!this.m_queueList.has(message.guild.id)) {
            writer.writeMessage(message, {
                title: "Audio Queue",
                subtitle: "The Queue is empty at the moment!",
                message: `Use the "${process.env.PREFIX}play" command to add audios to the queue!`
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
    async $play(message, query) {
        try {
            let info = undefined;

            if(this.m_queueList.has(message.guild.id)) {

                const youtube_results = await SoundPlayer.searchYoutube(query, SEARCH_LIMIT);
                info = youtube_results[0];
                this.m_queueList.get(message.guild.id).push(info);

            } else {

                const connection = await this.$makeConnection(message);
                info = await connection.play(query, 0, SEARCH_LIMIT);

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

                if(previous_connection.channel.id == current_channel) {
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
        if(this.m_connectionList.get(message.guild.id).channel.members.size == 1) {
            this.leave(message);
            return;
        }
        
        this.m_queueList.get(message.guild.id).delete(0);
        if(this.m_queueList.get(message.guild.id).length > 0) {

            try {

                const info_block = this.m_queueList.get(message.guild.id)[0];
                await connection.searchUrlAndPlay(info_block.url);

            } catch(e) {
                throw e;
            }

        } else if (this.m_loopQueue.has(message.guild.id)) {
            const queue_random = this.m_loopQueue.get(message.guild.id).random;
            const new_queue = this.m_loopQueue.get(message.guild.id).list;

            const copy_queue = new storage.JSONArray(...new_queue);
            if(queue_random)
                this.$scrambleArray(copy_queue);
            
            this.m_queueList.set(message.guild.id, copy_queue);

            try {
                const info_block = this.m_queueList.get(message.guild.id)[0];
                await connection.searchUrlAndPlay(info_block.url);
            } catch(e) {
                throw e;
            }

        } else
            this.leave(message);
    }

    $isPlayingAudio(message) {
        if(!this.m_connectionList.has(message.guild.id))
            throw new ERROR.CommandErrorException(ERROR_MSG.INVALID_VOICE_CONN);
        
        if(!this.m_queueList.has(message.guild.id))
            throw new ERROR.CommandErrorException(ERROR_MSG.NO_VOICE);
    }

    $scrambleArray(array) {
        for(let i=array.length-1;i>=1;i--) {
            const random = Math.floor(Math.random() * (i - 1));
            const copy_value = array[i];
            array[i] = array[random];
            array[random] = copy_value;
        }
    }

    $connectionForceDisconnect(guildId) {
        this.m_connectionList.delete(guildId);
        this.m_queueList.delete(guildId);
        this.m_loopQueue.delete(guildId);
    }
}

module.exports = AudioPlayer;