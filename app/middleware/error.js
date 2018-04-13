'use strict';

/* eslint-disable no-unused-vars */
module.exports = function(err, req, res, next) {
    const params = {
        code: err.status || 500,
        message: err.message,
        error: req.app.get('env') === 'development' ? err : {}
    };

    res.status(params.code);
    if (req.path.startsWith('/api/')) {
        res.json(params);
    } else {
        res.render('error', params);
    }
};