const playdl = require("play-dl");
const voice  = require("@discordjs/voice");

const { ERROR, ERROR_MSG} = require("../../exceptions");

const AUDIO_SETTINGS = {
    behaviors: {
        noSubscriber: voice.NoSubscriberBehavior.Pause
    }
}

class VoiceChannelConnection {
    constructor(connection, player, channelId) {
        this.m_connection = connection;
        this.m_player = player;
        this.channel = channelId;
    }
    
    async play(query, index, searchLimit) {
        try {
            if(index < 0 || index >= searchLimit)
                throw new ERROR.OutOfBoundsException(ERROR_MSG.INDEX_OUT_OF_BOUNDS);
            
            const get_info = await this.search(query, searchLimit);
            const stream = await playdl.stream(get_info[index].url);

            const resource = voice.createAudioResource(stream.stream, { inputType: stream.type });
            this.m_player.play(resource);

            return get_info[index];
        } catch(e) {
            throw e;
        }
    }

    pause() {
        if(!this.isPlaying())
            return false;

        return this.m_player.pause(true);
    }

    resume() {
        if(!this.isPaused())
            return false;

        return this.m_player.unpause();
    }

    stop() {
        if(this.isIdle())
            return false;

        return this.m_player.stop(true);
    }

    leave() {
        this.m_connection.destroy();
    }

    isPlaying() {
        return this.m_player.state.status == voice.AudioPlayerStatus.Playing;
    }

    isPaused() {
        return this.m_player.state.status == voice.AudioPlayerStatus.Paused;
    }

    isIdle() {
        return this.m_player.state.status == voice.AudioPlayerStatus.Idle;
    }

    async search(query, limit) {
        const results = await playdl.search(query, { limit: limit });
        for(let i=0;i<results.length;i++) {
            const element = results[i];
            const new_format = {
                title: element.title,
                url: element.url,
                time: element.durationRaw,
                author: element.channel.name,
                thumbnail: element.thumbnails[0].url
            }
            results[i] = new_format;
        }
        return results;
    }
}

function join(message, onDisconnect, after) {
    try {
        if(!message.member.voice.channel)
            throw new ERROR.CommandErrorException(ERROR_MSG.VC_REQUIRED);
        
        const new_audio_player = voice.createAudioPlayer(AUDIO_SETTINGS);
        const channel_id = message.member.voice.channel.id;
        const connection = voice.joinVoiceChannel({
            channelId: channel_id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });

        connection.subscribe(new_audio_player);
        const voice_connection = new VoiceChannelConnection(connection, new_audio_player, channel_id);

        //disconnect callback
        connection.on(voice.VoiceConnectionStatus.Disconnected, () => {
            connection.destroy();
            if(typeof onDisconnect == "function")
                onDisconnect(message.guild.id);
        });

        //audio idle callback
        if(typeof after == "function") {
            new_audio_player.on(voice.AudioPlayerStatus.Idle, () => {
                after();
            });
        }

        return voice_connection;
    } catch(e) {
        throw e;
    }
}

module.exports = {
    join: join,
    VoiceChannelConnection: VoiceChannelConnection
};