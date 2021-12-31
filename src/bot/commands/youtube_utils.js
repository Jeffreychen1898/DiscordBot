const playdl = require("play-dl");
const voice  = require("@discordjs/voice");

const { ERROR, ERROR_MSG} = require("../../exceptions");

const AUDIO_SETTINGS = {
    behaviors: {
        noSubscriber: voice.NoSubscriberBehavior.Pause
    }
}

async function searchYoutube(query, limit) {
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

class VoiceChannelConnection {
    constructor(connection, player, channel) {
        this.m_connection = connection;
        this.m_player = player;
        this.channel = channel;
    }
    
    async play(query, index, searchLimit) {
        try {
            if(index < 0 || index >= searchLimit)
                throw new ERROR.OutOfBoundsException(ERROR_MSG.INDEX_OUT_OF_BOUNDS);
            
            const get_info = await searchYoutube(query, searchLimit);
            const stream = await playdl.stream(get_info[index].url);

            const resource = voice.createAudioResource(stream.stream, { inputType: stream.type });
            this.m_player.play(resource);

            return get_info[index];
        } catch(e) {
            throw e;
        }
    }

    async searchUrlAndPlay(url) {
        try {

            const stream = await playdl.stream(url);
            const resource = voice.createAudioResource(stream.stream, { inputType: stream.type });
            this.m_player.play(resource);

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
}

function join(message, onDisconnect, after) {
    try {
        if(!message.member.voice.channel)
            throw new ERROR.CommandErrorException(ERROR_MSG.VC_REQUIRED);
        
        const new_audio_player = voice.createAudioPlayer(AUDIO_SETTINGS);
        const connection = voice.joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });

        connection.subscribe(new_audio_player);
        const voice_connection = new VoiceChannelConnection(connection, new_audio_player, message.member.voice.channel);

        //disconnect callback
        connection.on(voice.VoiceConnectionStatus.Disconnected, () => {
            connection.destroy();
            if(typeof onDisconnect == "function")
                onDisconnect(message.guild.id);
        });

        //audio idle callback
        if(typeof after == "function") {
            new_audio_player.on(voice.AudioPlayerStatus.Idle, () => {
                after(voice_connection);
            });
        }

        return voice_connection;
    } catch(e) {
        throw e;
    }
}

module.exports = {
    join: join,
    searchYoutube: searchYoutube,
    VoiceChannelConnection: VoiceChannelConnection
};