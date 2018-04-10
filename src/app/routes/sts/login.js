'use strict';

const express = require('express');

const idps = require('./idps');
const stateUtils = require('./utils/state');

const router = express.Router(); // eslint-disable-line new-cap

router.get('/', async function(req, res, next) {
    const state = await stateUtils.getRequiredState(req, next);
    if (!state) {
        return;
    }

    res.render('sts/login', {
        title: 'RESTer - Login',
        idps: Object.values(idps).map(idp => ({
            name: idp.displayName,
            url: idp.getAuthorizeUrl(state._id)
        }))
    });
});

module.exports = router;
