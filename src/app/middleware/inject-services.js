'use strict';

const MongoClient = require('mongodb').MongoClient;

const googleIdpFactory = require('../lib/idps/google');

module.exports = async function({
    mongoDbUrl,
    mongoDbName,
    googleClientId,
    googleClientSecret
}) {
    const mongoClient = await MongoClient.connect(mongoDbUrl);
    const idps = {
        google: await googleIdpFactory({
            clientId: googleClientId,
            clientSecret: googleClientSecret
        })
    };

    return function(req, res, next) {
        req.$ = {
            db: mongoClient.db(mongoDbName),
            idps
        };
        next();
    };
};
