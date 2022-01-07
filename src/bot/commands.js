const { ERROR, ERROR_MSG } = require("../exceptions.js");
const Parser = require("./parser.js");

const AudioPlayer = require("./commands/audioplayer.js");

async function onMessage(message) {
    const invoke_command = process.env.PREFIX;

    if(message.content.length == 0)
        return;
    
    if(message.content[0] == invoke_command) {
        const message_content = message.content.slice(1);
        if(message_content.length == 0)
            return;
        
        const parser = new Parser(message_content);
        parser.parse();

        await trigger(message, parser.commands, parser.parameters, parser.content);
    }
}

const audioPlayer = new AudioPlayer();

async function trigger(message, commands, parameters, content) {
    if(commands[0] == "audio")
        await audioPlayer.trigger(message, commands, parameters, content);
    
    else
        throw new ERROR.CommandNotFoundException(ERROR_MSG.COMMAND_NOT_FOUND);
}

module.exports = {
    onMessage: onMessage
};