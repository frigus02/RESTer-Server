'use strict';

/**
 * interface OAuth2Code {
 *     _id: String (uuid)
 *     clientId: String
 *     userId: String
 * }
 */

const uuidV4 = require('uuid/v4');

const collection = 'sts-oauth2-refresh-tokens';

exports.create = async function(db, clientId, userId) {
    const code = {
        _id: uuidV4(),
        clientId,
        userId
    };

    await db.collection(collection).insert(code);
    return code;
};

exports.get = async function(db, _id) {
    return await db.collection(collection).findOne({ _id });
};

exports.queryByUserId = async function(db, userId) {
    const cursor = await db
        .collection(collection)
        .find({ userId }, { userId: 0 });
    return await cursor.toArray();
};

exports.deleteForUser = async function(db, userId, _id) {
    await db.collection(collection).remove({ _id, userId });
};
