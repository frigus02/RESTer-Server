'use strict';

const MongoClient = require('mongodb').MongoClient;

exports.withDb = async function(callback) {
    const client = await MongoClient.connect(process.env.MONGO_DB_URL);
    try {
        return await callback(client.db(process.env.MONGO_DB_NAME));
    } finally {
        client.close();
    }
};
