const mongoose = require("mongoose");

const { ERROR, ERROR_MSG } = require("../exceptions.js");
const createSchemas = require("./mongo_schema.js");

let databaseConnection = null;
let schemas = null;

class Collection {
    constructor(collection) {
        this.m_collection = collection;
    }

    insertData(insertData, callback) {
        this.$checkConnectionStatus();

        const data = new this.m_collection(insertData);

        if(typeof callback != "function")
            callback = () => {}

        data.save(callback);
    }

    async update(search, update) {
        this.$checkConnectionStatus();
        try {
            
            await this.m_collection.update(search, update);

        } catch(e) {
            throw e;
        }
    }

    async updateone(search, update) {
        this.$checkConnectionStatus();
        try {
            
            await this.m_collection.findOneAndUpdate(search, update);

        } catch(e) {
            throw e;
        }
    }

    async findone(search) {
        this.$checkConnectionStatus();
        try {
            
            const result = await this.m_collection.findOne(search);
            return result;

        } catch(e) {
            throw e;
        }
    }

    async find(search) {
        this.$checkConnectionStatus();
        try {

            const result = await this.m_collection.find(search);
            return result;

        } catch(e) {
            throw e;
        }
    }

    /* private */
    $checkConnectionStatus() {
        if(schemas == null || databaseConnected == null)
            throw new ERROR.DatabaseLostConnection(ERROR_MSG.ERROR_MSG.UNEXPECTED_DB_ERROR);
    }
}

function getCollection(collectionName) {
    const schema = schemas.get(collectionName);
    const collection = new Collection(schema);

    return collection;
}

function databaseConnected(connection) {
    databaseConnected = connection;

    try {
        mongoose.connection.on("disconnected", databaseOnDisconnected);

        schemas = createSchemas();

    } catch(e) {
        if(process.env.PRODUCTION)
            console.error(ERROR_MSG.UNEXPECTED_DB_ERROR);
        else
            throw e;
    }
}

function databaseOnDisconnected() {
    schemas = null;
    databaseConnected = null;
}

module.exports = {
    databaseConnected: databaseConnected,
    getCollection: getCollection
};