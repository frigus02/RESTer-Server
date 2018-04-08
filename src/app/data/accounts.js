'use strict';

/**
 * interface Account {
 *     _id: String (uuid)
 *     name: String (Unique ID from the IDP, e.g. john.doe@example.com)
 *     idp: String (e.g. email, google)
 *     userId: String
 * }
 */

const uuidV4 = require('uuid/v4');

const { withDb } = require('../utils/mongo');
const collection = 'accounts';

exports.create = async function(account) {
    const accountWithId = {
        ...account,
        _id: uuidV4()
    };

    return await withDb(async db => {
        await db.collection(collection).insert(accountWithId);
        return accountWithId;
    });
};

exports.get = async function(name, idp) {
    return await withDb(async db => {
        return await db.collection(collection).findOne({ name, idp });
    });
};

exports.delete = async function(name, idp) {
    return await withDb(async db => {
        return await db.collection(collection).remove({ name, idp });
    });
};
