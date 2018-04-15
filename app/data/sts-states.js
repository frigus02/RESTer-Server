'use strict';

/**
 * interface State {
 *     _id: String (uuid)
 *     expires: Date
 *     properties: Object
 * }
 */

const uuidV4 = require('uuid/v4');

const collection = 'sts-states';
const defaultValidForMillis = 1000 * 60 * 60;

exports.create = async function(db, properties) {
    const expires = new Date(Date.now() + defaultValidForMillis);
    const state = {
        _id: uuidV4(),
        expires,
        properties
    };

    await db.collection(collection).insert(state);
    return state;
};

exports.get = async function(db, _id) {
    const state = await db.collection(collection).findOne({ _id });
    if (state && state.expires.getTime() > Date.now()) {
        return state;
    }
};

exports.update = async function(db, state) {
    return await db
        .collection(collection)
        .update({ _id: state._id }, { $set: { properties: state.properties } });
};
