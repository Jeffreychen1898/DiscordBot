require("dotenv").config();

const express = require("express");
const app = express();

const requests = require("./web/requests.js");
const bot = require("./bot/bot.js");

function main() {
    requests(app);
    bot();
}

app.listen(process.env.PORT, main);