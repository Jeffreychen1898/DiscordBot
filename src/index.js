require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();

const storage = require("./storage/storage.js");
const requests = require("./web/requests.js");
const bot = require("./bot/bot.js");

function main(database, connected) {
    if(connected) {
        console.log("MongoDB has been successfully connected!");
        storage.databaseConnected(database);
    } else
        console.error("Connection to MongoDB database was not successful!");

    requests(app);
    bot();
}

const DATABASE_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

app.listen(process.env.PORT, () => {
    mongoose.connect(process.env.DB_CONNECTION, DATABASE_OPTIONS).then(connection => main(connection, true)).catch(error => main(error, false));
});