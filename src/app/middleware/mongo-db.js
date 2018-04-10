'use strict';

const MongoClient = require('mongodb').MongoClient;

module.exports = function({ url, dbName }) {
    const clientPromise = MongoClient.connect(url);

    return async function(req, res, next) {
        const client = await clientPromise;
        req.db = client.db(dbName);
        next();
    };
};
