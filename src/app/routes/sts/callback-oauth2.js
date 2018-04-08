'use strict';

const express = require('express');

const idps = require('./idps/all');
const states = require('../../data/sts-states');
const accounts = require('../../data/accounts');
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

    try {
        const state = await stateUtils.getRequiredState(req.query.state);

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
            const account = await accounts.get(idp.name, profile.id);

            if (account) {
                return res.redirect(
                    oauth2Utils.getSuccessRedirectUrl(
                        state.properties.oauth2,
                        account.userId
                    )
                );
            } else {
                state.properties.account = {
                    id: profile.id,
                    idp: idp.name
                };
                state.properties.user = {
                    email: profile.email,
                    givenName: profile.givenName,
                    familyName: profile.familyName,
                    displayName: profile.displayName,
                    pictureUrl: profile.pictureUrl
                };

                await states.update(state);
                return res.redirect(`/sts/register?state=${state.id}`);
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
    } catch (err) {
        next(err);
    }
});

module.exports = router;
