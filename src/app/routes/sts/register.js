'use strict';

const express = require('express');

const users = require('../../data/users');
const render = require('../../utils/render');
const oauth2Utils = require('./utils/oauth2.js');
const stateUtils = require('./utils/state');

const router = express.Router(); // eslint-disable-line new-cap

router.get('/', async function(req, res, next) {
    const state = await stateUtils.getRequiredState(req, next);
    if (!state) {
        return;
    }

    render(res, 'sts/register', {
        title: 'RESTer - Register',
        user: state.properties.user,
        account: state.properties.account
    });
});

router.post('/', async function(req, res, next) {
    const state = await stateUtils.getRequiredState(req, next);
    if (!state) {
        return;
    }

    const userProps = {
        givenName: req.body.givenName,
        familyName: req.body.familyName,
        displayName: req.body.displayName,
        street: req.body.street,
        city: req.body.city,
        zip: req.body.zip,
        state: req.body.state,
        country: req.body.country,
        email: req.body.email,
        accounts: [
            {
                idp: state.properties.account.idp,
                name: state.properties.account.name
            }
        ]
    };

    try {
        const user = await users.create(req.db, userProps);

        const redirectUrl = await oauth2Utils.getSuccessRedirectUrl(
            state.properties.oauth2,
            user._id
        );
        res.redirect(redirectUrl);
    } catch (err) {
        const redirectUrl = oauth2Utils.getErrorRedirectUrl(
            state.properties.oauth2,
            'server_error',
            `Failed to create user account: ${err.message}`
        );
        return res.redirect(redirectUrl);
    }
});

module.exports = router;
