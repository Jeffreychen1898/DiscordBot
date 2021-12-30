const discord = require("discord.js");

const Commands = require("./commands.js");
const { ERROR } = require("../exceptions.js");
const writer = require("./writer.js");

function onMessage(message, commands) {
    const empty_method = () => {}

    commands.onMessage(message).then(empty_method).catch((e) => {

        if(e instanceof ERROR.InvalidStatementException)
            writer.printError(message, "Invalid Statement Exception!", e.message);
        
        else if(e instanceof ERROR.CommandNotFoundException)
            writer.printError(message, "Cannot Not Found Exception!", e.message);
        
        else if(e instanceof ERROR.CommandErrorException)
            writer.printError(message, "Command Error Exception!", e.message);

        else if(e instanceof ERROR.OutOfBoundsException)
            writer.printError(message, "Out Of Bounds Exception!", e.message);

        else
            if(process.env.PRODUCTION) {
                writer.printError(message, "Unexpected Error!", "An unexpected error has occurred!");
                console.error(e.message);
            } else
                throw e;
    });
}

function onReady(bot) {
    console.log(`Discord bot is now logged in as ${bot.user.username}!`);
}

function discordBot() {
    const intents = [
        discord.Intents.FLAGS.GUILDS,
        discord.Intents.FLAGS.GUILD_MEMBERS,
        discord.Intents.FLAGS.GUILD_MESSAGES,
        discord.Intents.FLAGS.GUILD_VOICE_STATES
    ];
    const bot = new discord.Client({intents: intents});
    
    const commands = new Commands();

    bot.on("ready", () => onReady(bot));
    bot.on("messageCreate", message => onMessage(message, commands));

    bot.login(process.env.BOT_TOKEN);
}

module.exports = discordBot;