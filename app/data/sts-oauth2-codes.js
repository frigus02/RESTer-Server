'use strict';

/**
 * interface OAuth2Code {
 *     _id: String (uuid)
 *     expires: Date
 *     clientId: String
 *     redirectUri: String
 *     userId: String
 * }
 */

const uuidV4 = require('uuid/v4');

const collection = 'sts-oauth2-codes';
const defaultValidForMillis = 1000 * 60 * 5;

exports.create = async function(db, clientId, redirectUri, userId) {
    const expires = new Date(Date.now() + defaultValidForMillis);
    const code = {
        _id: uuidV4(),
        expires,
        clientId,
        redirectUri,
        userId
    };

    await db.collection(collection).insert(code);
    return code;
};

exports.getAndDelete = async function(db, _id) {
    const code = await db.collection(collection).findOne({ _id });
    if (code) {
        await db.collection(collection).remove({ _id });
        if (code.expires.getTime() > Date.now()) {
            return code;
        }
    }
};
