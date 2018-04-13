'use strict';

const express = require('express');

const states = require('../../data/sts-states');
const oauth2Utils = require('../../lib/oauth2');

const router = express.Router(); // eslint-disable-line new-cap
const supportedResponseTypes = ['token'];

router.get('/authorize', async function(req, res, next) {
    const clientId = req.query.client_id;
    const redirectUri = req.query.redirect_uri;
    if (!oauth2Utils.validateClient(clientId, redirectUri)) {
        const error = new Error(`Invalid client_id or redirect_uri.`);
        error.status = 400;
        return next(error);
    }

    const incomingState = req.query.state;
    const responseType = req.query.response_type;
    const oauth2Properties = {
        clientId,
        redirectUri,
        responseType,
        state: incomingState
    };

    if (!supportedResponseTypes.includes(responseType)) {
        return res.redirect(
            oauth2Utils.getErrorRedirectUrl(
                oauth2Properties,
                'unsupported_response_type'
            )
        );
    }

    const state = await states.create(req.$.db, { oauth2: oauth2Properties });
    res.redirect(`/sts/login?state=${state._id}`);
});

module.exports = router;
