const playdl = require("play-dl");
const voice  = require("@discordjs/voice");

const { ERROR, ERROR_MSG} = require("../../exceptions");

/*
retrieve data:
    Title
    URL
    Timestamp
    Thumbnail
    Author

queue data:
    Title
    URL
    Timestamp
*/
const AUDIO_SETTINGS = {
    behaviors: {
        noSubscriber: voice.NoSubscriberBehavior.Pause
    }
}

class SoundPlayer {
    constructor(searchLimit) {
        this.m_searchLimit = searchLimit;

        this.m_guildId = undefined;
        this.m_connection = null;

        this.m_audioPlayer = voice.createAudioPlayer(AUDIO_SETTINGS);
    }

    join(message) {
        try {
            if(message.member.voice == undefined)
                throw new ERROR.CommandNotFoundException(ERROR_MSG.VC_REQUIRED);
            
            if(this.m_guildId == message.guild.id)
                return;

            if(this.m_connection != null)
                this.m_connection.destroy();

            this.m_guildId = message.guild.id;
            this.m_connection = voice.joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            });

            this.m_connection.subscribe(this.m_audioPlayer);
        } catch(e) {
            throw e;
        }
    }

    async play(searchQuery, index) {
        try {
            if(index < 0 || index >= this.m_searchLimit)
                throw new ERROR.OutOfBoundsException(ERROR_MSG.INDEX_OUT_OF_BOUNDS);
            
            const get_info = await this.search(searchQuery);
            const stream = await playdl.stream(get_info[index].url);

            const resource = voice.createAudioResource(stream.stream, { inputType: stream.type });
            this.m_audioPlayer.play(resource);

            return get_info[index];
        } catch(e) {
            throw e;
        }
    }

    async search(searchQuery) {
        const results = await playdl.search(searchQuery, { limit: this.m_searchLimit });
        for(let i=0;i<results.length;i++) {
            const element = results[i];
            const new_format = {
                title: element.title,
                url: element.url,
                time: element.durationRaw,
                author: element.channel.name,
                thumbnail: element.thumbnails[0].url
            }
            element[i] = new_format;
        }
        return results;
    }

    pause() {
        if(!this.isPlaying())
            return false;

        return this.m_audioPlayer.pause(true);
    }

    resume() {
        if(!this.isPaused())
            return false;

        return this.m_audioPlayer.unpause();
    }

    stop() {
        if(this.isIdle())
            return false;

        return this.m_audioPlayer.stop(true);
    }

    leave() {
        if(this.m_connection == null)
            return false;

        this.m_connection.destroy();
        this.m_connection = null;

        return true;
    }

    isPlaying() {
        return this.m_audioPlayer.state.status == voice.AudioPlayerStatus.Playing;
    }

    isPaused() {
        return this.m_audioPlayer.state.status == voice.AudioPlayerStatus.Paused;
    }

    isIdle() {
        return this.m_audioPlayer.state.status == voice.AudioPlayerStatus.Idle;
    }
}

module.exports = SoundPlayer;