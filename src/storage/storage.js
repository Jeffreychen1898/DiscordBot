const memoryStorage = require("./memory.js");
const databaseStorage = require("./database.js");

module.exports = {
    JSONObject: memoryStorage.JSONObject,
    JSONArray: memoryStorage.JSONArray,
    cacheObject: memoryStorage.cacheObject,
    cacheRetrieve: memoryStorage.cacheRetrieve,
    databaseConnected: databaseStorage.databaseConnected,
    getCollection: databaseStorage.getCollection
};