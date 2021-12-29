const { ERROR, ERROR_MSG } = require("../exceptions.js");
const utils = require("./commands/youtube_utils.js");
const ytdl = require("ytdl-core-discord");
const {joinVoiceChannel, createAudioResource, createAudioPlayer} = require("@discordjs/voice");

class CommandTrigger {
    constructor() {
        //
    }

    async triggerCommands(message, command, parameters) {
        //console.log(await utils("https://youtube.com/watch?v=dQw4w9WgXcQ", 5));
        /*message.member.voiceChannel.join().then(async (connection) => {
            const stuff = await ytdl("https://youtube.com/watch?v=dQw4w9WgXcQ")
            connection.play(stuff, {type:"opus"});
        });*/
        try {

            const stuff = await ytdl("https://www.youtube.com/watch?v=WrHDquZ-tj0");
            const conn = await joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            });
            const audio = createAudioPlayer();
            const res = createAudioResource(stuff, {seek: 0});
            audio.play(res);
            conn.subscribe(audio);
            //throw new ERROR.CommandNotFoundException(ERROR_MSG.COMMAND_NOT_FOUND);

        } catch(e) {
            throw e;
        }
    }
}

module.exports = CommandTrigger;