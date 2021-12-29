const search = require("yt-search");

async function find_urls(query, limit) {
    let results = await search(query);
    let filtered = results.all.filter(filterVideos);
    return filtered.slice(0, 5);
}

function filterVideos(element) {
    return element.type == "video";
}

module.exports = find_urls;