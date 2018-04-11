'use strict';

const render = require('../utils/render');

/* eslint-disable no-unused-vars */
module.exports = function(err, req, res, next) {
    const params = {
        code: err.status || 500,
        message: err.message,
        error: req.app.get('env') === 'development' ? err : {}
    };

    res.status(params.code);
    if (req.xhr) {
        res.json(params);
    } else {
        render(res, 'error', params);
    }
};
