'use strict';

const express = require('express');

const idps = require('./idps');
const states = require('../../data/sts-states');
const users = require('../../data/users');
const oauth2Utils = require('./utils/oauth2.js');
const stateUtils = require('./utils/state');

const router = express.Router(); // eslint-disable-line new-cap

router.get('/:idp', async function(req, res, next) {
    const idp = idps[req.params.idp];
    if (!idp) {
        const err = new Error(
            `Invalid identity provider: ${
                req.params.idp
            }. Supported are: ${Object.keys(idps).join(', ')}.`
        );
        err.code = 404;
        return next(err);
    }

    const state = await stateUtils.getRequiredState(req, next);
    if (!state) {
        return;
    }

    if (req.query.error) {
        return res.redirect(
            oauth2Utils.getErrorRedirectUrl(
                state.properties.oauth2,
                'server_error',
                `The selected IDP ${idp.name} responsed with the error ${
                    req.query.error
                }: ${req.query.error_description}`
            )
        );
    }

    const code = req.query.code;
    if (!code) {
        return res.redirect(
            oauth2Utils.getErrorRedirectUrl(
                state.properties.oauth2,
                'server_error',
                `The selected IDP ${idp.name} did not return a code.`
            )
        );
    }

    try {
        const token = await idp.exchangeCodeIntoToken(code);
        const profile = await idp.getUserProfile(token);
        const user = await users.getByAccount(req.db, idp.name, profile.id);

        if (user) {
            const redirectUrl = await oauth2Utils.getSuccessRedirectUrl(
                state.properties.oauth2,
                user._id
            );
            return res.redirect(redirectUrl);
        } else {
            state.properties.account = {
                idp: idp.name,
                name: profile.id
            };
            state.properties.user = {
                email: profile.email,
                givenName: profile.givenName,
                familyName: profile.familyName,
                displayName: profile.displayName,
                pictureUrl: profile.pictureUrl
            };

            await states.update(req.db, state);
            return res.redirect(`/sts/register?state=${state._id}`);
        }
    } catch (err) {
        const redirectUrl = oauth2Utils.getErrorRedirectUrl(
            state.properties.oauth2,
            'server_error',
            `Failed to retrieve user profile from IDP ${idp.name}: ${
                err.message
            }`
        );
        return res.redirect(redirectUrl);
    }
});

module.exports = router;
