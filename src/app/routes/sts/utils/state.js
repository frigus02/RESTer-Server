'use strict';

const states = require('../../../data/sts-states');

exports.getRequiredState = async function(stateId) {
    if (!stateId) {
        const err = new Error('No state parameter provided.');
        err.code = 400;
        return Promise.reject(err);
    }

    const state = await states.get(stateId);

    if (state) {
        return state;
    } else {
        const err = new Error('State does not exist.');
        err.code = 400;
        return Promise.reject(err);
    }
};
