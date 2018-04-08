'use strict';

const azure = require('azure-storage');
const { promisify } = require('util');

const retryOperations = new azure.ExponentialRetryPolicyFilter();
const tableService = azure.createTableService().withFilter(retryOperations);
const entGen = azure.TableUtilities.entityGenerator;

const createTableIfNotExists = promisify(
    tableService.createTableIfNotExists.bind(tableService)
);
const insertEntity = promisify(tableService.insertEntity.bind(tableService));
const replaceEntity = promisify(tableService.replaceEntity.bind(tableService));
const mergeEntity = promisify(tableService.mergeEntity.bind(tableService));
const insertOrReplaceEntity = promisify(
    tableService.insertOrReplaceEntity.bind(tableService)
);
const insertOrMergeEntity = promisify(
    tableService.insertOrMergeEntity.bind(tableService)
);
const retrieveEntity = promisify(
    tableService.retrieveEntity.bind(tableService)
);
const queryEntities = promisify(tableService.queryEntities.bind(tableService));
const deleteEntity = promisify(tableService.deleteEntity.bind(tableService));

class Table {
    constructor(tableName, converter) {
        this.tableName = tableName;
        this.converter = converter;

        this.created = false;
        this.creationPromise;
    }

    _createTableIfNotExists() {
        if (this.created) {
            return Promise.resolve();
        }

        if (!this.creationPromise) {
            this.creationPromise = createTableIfNotExists(this.tableName);
        }

        return this.creationPromise;
    }

    _serialize(obj) {
        const rawEntity = this.converter.serialize(obj);
        const entity = {};
        for (let key in rawEntity) {
            if (rawEntity.hasOwnProperty(key)) {
                if (key === 'PartitionKey' || key === 'RowKey') {
                    entity[key] = entGen.String(rawEntity[key]);
                } else {
                    entity[key] = new entGen.EntityProperty(rawEntity[key]);
                }
            }
        }

        return entity;
    }

    _deserialize(entity) {
        const rawEntity = {};
        for (let key in entity) {
            if (entity.hasOwnProperty(key)) {
                rawEntity[key] = entity[key]._;
            }
        }

        return this.converter.deserialize(rawEntity);
    }

    insert(obj) {
        return this._createTableIfNotExists().then(() =>
            insertEntity(this.tableName, this._serialize(obj))
        );
    }

    replace(obj) {
        return this._createTableIfNotExists().then(() =>
            replaceEntity(this.tableName, this._serialize(obj))
        );
    }

    merge(obj) {
        return this._createTableIfNotExists().then(() =>
            mergeEntity(this.tableName, this._serialize(obj))
        );
    }

    insertOrReplace(obj) {
        return this._createTableIfNotExists().then(() =>
            insertOrReplaceEntity(this.tableName, this._serialize(obj))
        );
    }

    insertOrMerge(obj) {
        return this._createTableIfNotExists().then(() =>
            insertOrMergeEntity(this.tableName, this._serialize(obj))
        );
    }

    retrieve(partitionKey, rowKey) {
        return this._createTableIfNotExists()
            .then(() => retrieveEntity(this.tableName, partitionKey, rowKey))
            .then(entity => this._deserialize(entity))
            .catch(err => {
                if (err.statusCode === 404) {
                    return null;
                } else {
                    return Promise.reject(err);
                }
            });
    }

    query(query) {
        return this._createTableIfNotExists()
            .then(() => queryEntities(this.tableName, query, null))
            .then(result =>
                result.entries.map(entity => this._deserialize(entity))
            );
    }

    delete(obj) {
        return this._createTableIfNotExists().then(() =>
            deleteEntity(this.tableName, this._serialize(obj))
        );
    }
}

exports.Table = Table;
exports.TableQuery = azure.TableQuery;
