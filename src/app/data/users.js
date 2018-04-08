'use strict';

/**
 * interface User {
 *     id: String (uuid)
 *     givenName: String
 *     familyName: String
 *     displayName: String
 *     street: String
 *     city: String
 *     zip: String
 *     state: String
 *     country: String
 *     email: String
 *     accounts: Array (e.g. [{"idp":"email","id":"jan.kuehle@matrix42.com"}])
 * }
 */

const uuidV4 = require('uuid/v4');

const tableUtils = require('../utils/azure-table');

const table = new tableUtils.Table('Users', {
    serialize(obj) {
        return {
            PartitionKey: obj.id.toLowerCase(),
            RowKey: obj.id.toLowerCase(),
            GivenName: obj.givenName,
            FamilyName: obj.familyName,
            DisplayName: obj.displayName,
            Street: obj.street,
            City: obj.city,
            Zip: obj.zip,
            State: obj.state,
            Country: obj.Country,
            Email: obj.email,
            Accounts: JSON.stringify(obj.accounts)
        };
    },
    deserialize(entity) {
        return {
            id: entity.PartitionKey,
            givenName: entity.GivenName,
            familyName: entity.FamilyName,
            displayName: entity.DisplayName,
            street: entity.Street,
            city: entity.City,
            zip: entity.Zip,
            state: entity.State,
            country: entity.Country,
            email: entity.Email,
            accounts: JSON.parse(entity.Accounts)
        };
    }
});

exports.generateId = function() {
    return uuidV4();
};

exports.createOrUpdate = function(user) {
    if (!user.id) {
        user.id = uuidV4();
    }

    return table.insertOrReplace(user).then(() => user);
};

exports.get = function(id) {
    return table.retrieve(id, id);
};

exports.delete = function(id) {
    return table.delete({ id });
};
