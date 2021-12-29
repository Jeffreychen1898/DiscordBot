const ytdl = require("ytdl-core");
const search = require("yt-search");

async function find_urls(query) {
    const results = await search(query);
    return results;
}

module.exports = find_urls;