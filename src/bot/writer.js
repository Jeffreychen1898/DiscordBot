const discord = require("discord.js");

const COLOR_ERROR = 0xcc0000;
const COLOR_SUCCESS = 0x009e0c;

const BLANK_CHARACTER = "\u200b";

function printError(message, type, content) {
    const embed = new discord.MessageEmbed();
    embed.setTitle("ERROR");
    embed.setColor(COLOR_ERROR);
    embed.addField(type, content, false);
    sendMessage(message, embed);
}

/*
    title: String
    message: Array | String
    subtitle: String                OPTIONAL
    thumbnail: String               OPTIONAL
    url: String                     OPTIONAL
*/
function writeMessage(message, data) {
    const subtitle = data.subtitle?data.subtitle:BLANK_CHARACTER;

    const embed = new discord.MessageEmbed();
    embed.setTitle(data.title);
    embed.setColor(COLOR_SUCCESS);
    if(typeof data.message == "object") {

        let message_string = "";
        for(let i=0;i<data.message.length;i++)
            message_string += (i == 0?"":"\n") + data.message[i];
        
        embed.addField(subtitle, message_string, false);

    } else if(typeof data.message == "string")
        embed.addField(subtitle, data.message, false);
    
    if(data.thumbnail)
        embed.setThumbnail(data.thumbnail);
    if(data.url)
        embed.setURL(data.url);
    
    sendMessage(message, embed);
}

function sendMessage(message, embed) {
    const text = `Responding to ${message.member.nickname}`;
    const image = message.author.avatarURL();
    embed.setFooter(text, image);

    message.channel.send({ embeds: [embed] });
}

module.exports = {
    printError,
    sendMessage,
    writeMessage
};