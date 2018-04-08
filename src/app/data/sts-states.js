'use strict';

/**
 * interface State {
 *     id: String (uuid + expires)
 *     expires: Date
 *     properties: Object
 * }
 */

const uuidV4 = require('uuid/v4');

const tableUtils = require('../utils/azure-table');

const table = new tableUtils.Table('StsStates', {
    serialize(obj) {
        return {
            PartitionKey: getPartitionKeyFromExpires(obj.expires),
            RowKey: obj.id.toLowerCase(),
            Properties: JSON.stringify(obj.properties)
        };
    },
    deserialize(entity) {
        return {
            id: entity.RowKey,
            expires: getExpiresFromId(entity.RowKey),
            properties: JSON.parse(entity.Properties)
        };
    }
});
const defaultValidForMillis = 1000 * 60 * 60;

function getPartitionKeyFromExpires(expires) {
    return `${expires.getFullYear()}-${expires.getMonth() +
        1}-${expires.getDate()}`;
}

function getExpiresFromId(id) {
    return new Date(parseInt(id.split('-')[0], 10));
}

exports.create = function(properties) {
    const expires = new Date(Date.now() + defaultValidForMillis);
    const state = {
        id: `${expires.getTime()}-${uuidV4()}`,
        expires,
        properties
    };

    return table.insert(state).then(() => state);
};

exports.get = function(id) {
    const expires = getExpiresFromId(id);
    const partitionKey = getPartitionKeyFromExpires(expires);

    return table.retrieve(partitionKey, id).then(state => {
        if (state && state.expires.getTime() > Date.now()) {
            return state;
        }
    });
};

exports.update = function(state) {
    return table.replace(state);
};

exports.delete = function(id) {
    return table.delete({ id, expires: getExpiresFromId(id) });
};
