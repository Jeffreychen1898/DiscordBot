const discord = require("discord.js");

const Commands = require("./commands.js");
const { ERROR } = require("../exceptions.js");
const writer = require("./writer.js");

async function onMessage(message, commands) {
    try {
        await commands.onMessage(message);
    } catch(e) {
        if(e instanceof ERROR.InvalidStatementException)
            writer.printError(message, "Invalid Statement Exception!", e.message);
        
        else if(e instanceof ERROR.CommandNotFoundException)
            writer.printError(message, "Cannot Not Found Exception!", e.message);

        else
            throw e;
    }
}

function onReady(bot) {
    console.log(`Discord bot is now logged in as ${bot.user.username}!`);
}

function bot() {
    const intents = [
        discord.Intents.FLAGS.GUILDS,
        discord.Intents.FLAGS.GUILD_MEMBERS,
        discord.Intents.FLAGS.GUILD_MESSAGES
    ];
    const bot = new discord.Client({intents: intents});
    
    const commands = new Commands();

    bot.on("ready", () => onReady(bot));
    bot.on("messageCreate", message => onMessage(message, commands));

    bot.login(process.env.BOT_TOKEN);
}

module.exports = bot;