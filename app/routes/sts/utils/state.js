'use strict';

const states = require('../../../data/sts-states');

exports.getRequiredState = async function(req, next) {
    if (!req.query.state) {
        const err = new Error('No state parameter provided.');
        err.code = 400;
        next(err);
        return;
    }

    const state = await states.get(req.$.db, req.query.state);

    if (state) {
        return state;
    } else {
        const err = new Error('State does not exist.');
        err.code = 400;
        next(err);
    }
};
