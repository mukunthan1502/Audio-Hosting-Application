require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;

const client = new MongoClient(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const dbo = {
    connectToServer: async (databaseName) => {
        await client.connect();
        _db = client.db(databaseName);
        return _db;
    },

    getClient() {
        return client;
    },

    getDb() {
        return _db;
    },

    closeConnection() {
        client.close();
    },
};

exports.dbo = dbo;
