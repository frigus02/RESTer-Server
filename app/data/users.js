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
 *     pictureUrl: String
 *     accounts: Array<{
 *         idp: String (e.g. email, google)
 *         name: String (Unique ID from the IDP, e.g. john.doe@example.com)
 *     }>
 * }
 */

const uuidV4 = require('uuid/v4');

const collection = 'users';

exports.projection = {
    id: {
        _id: 1
    },
    user: {
        _id: 0,
        accounts: 0
    }
};

exports.create = async function(db, user) {
    const userWithId = {
        ...user,
        _id: uuidV4()
    };

    await db.collection(collection).insert(userWithId);
    return userWithId;
};

exports.get = async function(db, _id, projection) {
    return await db.collection(collection).findOne({ _id }, { projection });
};

exports.getByAccount = async function(db, account, projection) {
    return await db
        .collection(collection)
        .findOne({ accounts: account }, { projection });
};

exports.delete = async function(db, _id) {
    return await db.collection(collection).remove({ _id });
};
