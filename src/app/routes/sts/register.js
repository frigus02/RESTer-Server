'use strict';

const express = require('express');

const accounts = require('../../data/accounts');
const users = require('../../data/users');
const oauth2Utils = require('./utils/oauth2.js');
const stateUtils = require('./utils/state');

const router = express.Router(); // eslint-disable-line new-cap

router.get('/', async function(req, res, next) {
    try {
        const state = await stateUtils.getRequiredState(req.query.state);
        res.render('sts/register', {
            title: 'RESTer - Register',
            user: state.properties.user,
            account: state.properties.account
        });
    } catch (err) {
        next(err);
    }
});

router.post('/', async function(req, res, next) {
    try {
        const state = await stateUtils.getRequiredState(req.query.state);
        const accountProps = {
            name: state.properties.account.name,
            idp: state.properties.account.idp
        };
        const userProps = {
            givenName: req.body.givenName,
            familyName: req.body.familyName,
            displayName: req.body.displayName,
            street: req.body.street,
            city: req.body.city,
            zip: req.body.zip,
            state: req.body.state,
            country: req.body.country,
            email: req.body.email
        };

        try {
            const user = await users.create(userProps);
            await accounts.create({
                ...accountProps,
                userId: user._id
            });

            const redirectUrl = await oauth2Utils.getSuccessRedirectUrl(
                state.properties.oauth2,
                user._id
            );
            res.redirect(redirectUrl);
        } catch (err) {
            return res.redirect(
                oauth2Utils.getErrorRedirectUrl(
                    state.properties.oauth2,
                    'server_error',
                    `Failed to create user account: ${err.message}`
                )
            );
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;
