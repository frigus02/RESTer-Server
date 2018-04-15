'use strict';

const url = require('url');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const codes = require('../data/sts-oauth2-codes');

const jwtSign = promisify(jwt.sign);
const publicKey = process.env.RESTER_OAUTH2_PUBLIC_KEY;
const privateKey = process.env.RESTER_OAUTH2_PRIVATE_KEY;

function getFragmentAccessTokenUrl({
    redirectUri,
    accessToken,
    tokenType,
    expiresIn,
    state
}) {
    const params = new url.URLSearchParams();
    params.set('access_token', accessToken);
    params.set('token_type', tokenType);
    expiresIn && params.set('expires_in', expiresIn);
    state && params.set('state', state);

    const tokenUrl = new url.URL(redirectUri);
    tokenUrl.hash = params.toString();

    return tokenUrl.toString();
}

function getFragmentErrorUrl({
    redirectUri,
    error,
    errorDescription,
    errorUri,
    state
}) {
    const params = new url.URLSearchParams();
    params.set('error', error);
    errorDescription && params.set('error_description', errorDescription);
    errorUri && params.set('error_uri', errorUri);
    state && params.set('state', state);

    const errorUrl = new url.URL(redirectUri);
    errorUrl.hash = params.toString();

    return errorUrl.toString();
}

function getQueryAuthorizationCodeUrl({ redirectUri, code, state }) {
    const codeUrl = new url.URL(redirectUri);
    codeUrl.searchParams.set('code', code);
    state && codeUrl.searchParams.set('state', state);

    return codeUrl.toString();
}

function getQueryErrorUrl({
    redirectUri,
    error,
    errorDescription,
    errorUri,
    state
}) {
    const errorUrl = new url.URL(redirectUri);
    errorUrl.searchParams.set('error', error);
    errorDescription &&
        errorUrl.searchParams.set('error_description', errorDescription);
    errorUri && errorUrl.searchParams.set('error_uri', errorUri);
    state && errorUrl.searchParams.set('state', state);

    return errorUrl.toString();
}

exports.publicKey = publicKey;
exports.tokenType = 'urn:ietf:params:oauth:token-type:jwt';

exports.getErrorRedirectUrl = function(
    oauth2Properties,
    error,
    errorDescription
) {
    const errorUrlFunc =
        oauth2Properties.responseType === 'token'
            ? getFragmentErrorUrl
            : getQueryErrorUrl;
    return errorUrlFunc({
        redirectUri: oauth2Properties.redirectUri,
        error,
        errorDescription,
        state: oauth2Properties.state
    });
};

exports.getSuccessRedirectUrl = async function(db, oauth2Properties, userId) {
    if (oauth2Properties.responseType === 'code') {
        const code = await codes.create(
            db,
            oauth2Properties.clientId,
            oauth2Properties.redirectUri,
            userId
        );

        return getQueryAuthorizationCodeUrl({
            redirectUri: oauth2Properties.redirectUri,
            code: code._id,
            state: oauth2Properties.state
        });
    } else if (oauth2Properties.responseType === 'token') {
        const { accessToken, expiresIn } = await exports.generateAccessToken(
            userId,
            oauth2Properties.clientId
        );

        return getFragmentAccessTokenUrl({
            redirectUri: oauth2Properties.redirectUri,
            accessToken,
            tokenType: exports.tokenType,
            expiresIn,
            state: oauth2Properties.state
        });
    }
};

exports.generateAccessToken = async function(userId, clientId) {
    const payload = {};
    const options = {
        algorithm: 'RS256',
        expiresIn: '1d',
        notBefore: 0,
        audience: clientId,
        issuer: 'https://rester.kuehle.me',
        subject: userId
    };

    const token = await jwtSign(payload, privateKey, options);

    return {
        accessToken: token,
        expiresIn: 86400
    };
};
