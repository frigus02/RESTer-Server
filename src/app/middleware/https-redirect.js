'use strict';

module.exports = function (req, res, next) {
    if (!req.secure && req.hostname !== 'localhost') {
        return res.redirect(`https://${req.hostname}${req.url}`);
    }

    next();
};
