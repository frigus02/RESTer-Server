'use strict';

const express = require('express');

const codes = require('../../data/sts-oauth2-codes');
const refreshTokens = require('../../data/sts-oauth2-refresh-tokens');
const states = require('../../data/sts-states');
const oauth2 = require('../../lib/oauth2');
const oauth2Utils = require('./utils/oauth2');

const router = express.Router(); // eslint-disable-line new-cap
const supportedResponseTypes = ['code', 'token'];

router.get('/authorize', async function(req, res, next) {
    const clientId = req.query.client_id;
    const redirectUri = req.query.redirect_uri;
    if (!oauth2Utils.validateClient(req, clientId, redirectUri)) {
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
            oauth2.getErrorRedirectUrl(
                oauth2Properties,
                'unsupported_response_type'
            )
        );
    }

    const state = await states.create(req.$.db, { oauth2: oauth2Properties });
    res.redirect(`/sts/login?state=${state._id}`);
});

router.post('/token', async function(req, res) {
    const authHeader = req.get('Authorization');
    if (authHeader && !authHeader.toLowerCase().startsWith('basic ')) {
        return res.status(401).json({
            error: 'invalid_client',
            error_description:
                'No authentication found, only HTTP Basic authentication is supported'
        });
    }

    const authToken = Buffer.from(authHeader.substr(6), 'base64').toString();
    const [encodedClientId, encodedClientSecret] = authToken.split(':');
    const clientId = decodeURIComponent(encodedClientId);
    const clientSecret = decodeURIComponent(encodedClientSecret);
    if (!oauth2Utils.validateClientAuth(clientId, clientSecret)) {
        return res.status(401).json({
            error: 'invalid_client',
            error_description: 'Invalid client_id or client_secret'
        });
    }

    const grantType = req.body.grant_type;
    if (grantType === 'authorization_code') {
        const codeId = req.body.code;
        const redirectUri = req.body.redirect_uri;
        if (!codeId || !redirectUri) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'Missing parameter: code or redirect_uri'
            });
        }

        try {
            const code = await codes.getAndDelete(req.$.db, codeId);
            if (
                !code ||
                code.clientId !== clientId ||
                code.redirectUri !== redirectUri
            ) {
                return res.status(400).json({
                    error: 'invalid_grant'
                });
            }

            const token = await oauth2.generateAccessToken(
                code.userId,
                clientId
            );
            const refreshToken = await refreshTokens.create(
                req.$.db,
                clientId,
                code.userId
            );

            return res.json({
                access_token: token.accessToken,
                token_type: oauth2.tokenType,
                expires_in: token.expiresIn,
                refresh_token: refreshToken._id
            });
        } catch (err) {
            return res.status(500).json({
                error: 'server_error',
                error_description: `Failed to validate grant or generate token: ${
                    err.message
                }`
            });
        }
    } else if (grantType === 'refresh_token') {
        const refreshTokenId = req.body.refresh_token;
        if (!refreshTokenId) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'Missing parameter: refresh_token'
            });
        }

        try {
            const refreshToken = await refreshTokens.get(
                req.$.db,
                refreshTokenId
            );
            if (!refreshToken || refreshToken.clientId !== clientId) {
                return res.status(400).json({
                    error: 'invalid_grant'
                });
            }

            const token = await oauth2.generateAccessToken(
                refreshToken.userId,
                clientId
            );

            return res.json({
                access_token: token.accessToken,
                token_type: oauth2.tokenType,
                expires_in: token.expiresIn
            });
        } catch (err) {
            return res.status(500).json({
                error: 'server_error',
                error_description: `Failed to validate grant or generate token: ${
                    err.message
                }`
            });
        }
    } else {
        return res.status(400).json({
            error: 'unsupported_grant_type'
        });
    }
});

module.exports = router;
