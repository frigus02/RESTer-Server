'use strict';

const express = require('express');

const accounts = require('../../data/accounts');
const users = require('../../data/users');
const oauth2Utils = require('./utils/oauth2.js');
const stateUtils = require('./utils/state');


const router = express.Router(); // eslint-disable-line new-cap

router.get('/', function (req, res, next) {
    stateUtils.getRequiredState(req.query.state).then(state => {
        res.render('sts/register', {
            title: 'RESTer - Register',
            user: state.properties.user,
            account: state.properties.account
        });
    }, next);
});

router.post('/', function (req, res, next) {
    stateUtils.getRequiredState(req.query.state).then(state => {
        const userId = users.generateId();
        const account = {
            id: state.properties.account.id,
            idp: state.properties.account.idp,
            userId
        };
        const user = {
            id: userId,
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
                account
            ]
        };

        accounts.createOrUpdate(account).then(() => {
            return users.createOrUpdate(user);
        }).then(() => {
            return oauth2Utils.getSuccessRedirectUrl(state.properties.oauth2, userId);
        }).then(redirectUrl => {
            return res.redirect(redirectUrl);
        }).catch(err => {
            return res.redirect(oauth2Utils.getErrorRedirectUrl(
                state.properties.oauth2,
                'server_error',
                `Failed to create user account: ${err.message}`));
        });
    }, next);
});

module.exports = router;
