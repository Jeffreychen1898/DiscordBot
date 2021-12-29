const discord = require("discord.js");

const COLOR_ERROR = 0xcc0000;
const COLOR_SUCCESS = 0x009e0c;

function printError(message, type, content) {
    const embed = new discord.MessageEmbed();
    embed.setTitle("ERROR");
    embed.setColor(COLOR_ERROR);
    embed.addField(type, content, false);
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
    sendMessage
};