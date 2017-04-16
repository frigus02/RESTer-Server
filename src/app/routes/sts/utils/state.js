'use strict';

const states = require('../../../data/sts-states');


exports.getRequiredState = function (stateId) {
    if (!stateId) {
        const err = new Error('No state parameter provided.');
        err.code = 400;
        return Promise.reject(err);
    }

    return states.get(stateId).then(state => {
        if (state) {
            return state;
        } else {
            const err = new Error('State does not exist.');
            err.code = 400;
            return Promise.reject(err);
        }
    });
};
