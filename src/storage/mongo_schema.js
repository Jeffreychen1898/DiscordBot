const mongoose = require("mongoose");

const playlist = {
    name: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    playlist: {
        type: Array,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    private: {
        type: Boolean,
        required: true
    }
};

function createSchemas() {
    const playlistSchema = new mongoose.Schema(playlist);
    
    const schemas = new Map();
    schemas.set("playlist", mongoose.model("playlist", playlistSchema));

    return schemas;
}

module.exports = createSchemas;