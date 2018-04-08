'use strict';

/**
 * interface State {
 *     _id: String (uuid)
 *     expires: Date
 *     properties: Object
 * }
 */

const uuidV4 = require('uuid/v4');

const { withDb } = require('../utils/mongo');
const collection = 'sts-states';
const defaultValidForMillis = 1000 * 60 * 60;

exports.create = async function(properties) {
    const expires = new Date(Date.now() + defaultValidForMillis);
    const state = {
        _id: uuidV4(),
        expires,
        properties
    };

    return await withDb(async db => {
        await db.collection(collection).insert(state);
        return state;
    });
};

exports.get = async function(_id) {
    return await withDb(async db => {
        const state = await db.collection(collection).findOne({ _id });
        if (state && state.expires.getTime() > Date.now()) {
            return state;
        }
    });
};

exports.update = async function(state) {
    return await withDb(async db => {
        return await db
            .collection(collection)
            .update(
                { _id: state._id },
                { $set: { properties: state.properties } }
            );
    });
};

exports.delete = async function(_id) {
    return await withDb(async db => {
        return await db.collection(collection).remove({ _id });
    });
};
