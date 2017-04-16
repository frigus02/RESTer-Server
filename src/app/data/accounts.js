'use strict';

/**
 * interface Account {
 *     id: String (Unique ID from the IDP, e.g. john.doe@example.com)
 *     idp: String (e.g. email, google)
 *     userId: String
 * }
 */

const tableUtils = require('../utils/azure-table');


const table = new tableUtils.Table('Accounts', {
    serialize(obj) {
        return {
            PartitionKey: obj.idp,
            RowKey: obj.id.toLowerCase(),
            UserId: obj.userId
        };
    },
    deserialize(entity) {
        return {
            id: entity.RowKey,
            idp: entity.PartitionKey,
            userId: entity.UserId
        };
    }
});


exports.createOrUpdate = function (account) {
    return table.insertOrReplace(account).then(() => account);
};

exports.get = function (idp, id) {
    return table.retrieve(idp, id);
};

exports.delete = function (idp, id) {
    return table.delete({ idp, id });
};
