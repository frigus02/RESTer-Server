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

function validateUpdateData(data) {
    const validFields = [
        'givenName',
        'familyName',
        'displayName',
        'street',
        'city',
        'zip',
        'state',
        'country',
        'pictureUrl'
    ];

    return validFields.reduce((validData, key) => {
        if (data.hasOwnProperty(key)) {
            validData[key] = data[key];
        }

        return validData;
    }, {});
}

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

exports.update = async function(db, _id, userData) {
    return await db
        .collection(collection)
        .updateOne({ _id }, { $set: validateUpdateData(userData) });
};
