'use strict';

/**
 * interface User {
 *     _id: String (uuid)
 *     givenName: String
 *     familyName: String
 *     displayName: String
 *     street: String
 *     city: String
 *     zip: String
 *     state: String
 *     country: String
 *     email: String
 * }
 */

const uuidV4 = require('uuid/v4');

const { withDb } = require('../utils/mongo');
const collection = 'users';

exports.create = async function(user) {
    const userWithId = {
        ...user,
        _id: uuidV4()
    };

    return await withDb(async db => {
        await db.collection(collection).insert(userWithId);
        return userWithId;
    });
};

exports.get = async function(_id) {
    return await withDb(async db => {
        return await db.collection(collection).findOne({ _id });
    });
};

exports.delete = async function(_id) {
    return await withDb(async db => {
        return await db.collection(collection).remove({ _id });
    });
};
