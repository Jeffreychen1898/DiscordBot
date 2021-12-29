const { JSONObject, JSONArray } = require("./json.js")

const cacheData = new Map();

function cacheObject(name) {
    const new_json_object = new JSONObject();
    cacheData.set(name, new_json_object);

    return new_json_object;
}

function cacheRetrieve(name) {
    return cacheData.get(name);
}

module.exports = {
    JSONObject: JSONObject,
    JSONArray: JSONArray,
    cacheObject: cacheObject,
    cacheRetrieve: cacheRetrieve
};