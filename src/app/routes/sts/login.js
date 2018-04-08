'use strict';

const express = require('express');

const idps = require('./idps');
const stateUtils = require('./utils/state');

const router = express.Router(); // eslint-disable-line new-cap

router.get('/', async function(req, res, next) {
    try {
        const state = await stateUtils.getRequiredState(req.query.state);
        res.render('sts/login', {
            title: 'RESTer - Login',
            idps: Object.values(idps).map(idp => ({
                name: idp.displayName,
                url: idp.getAuthorizeUrl(state.id)
            }))
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
