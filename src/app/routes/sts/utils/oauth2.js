'use strict';

const fs = require('fs');
const url = require('url');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const fsReadFile = promisify(fs.readFile);
const jwtSign = promisify(jwt.sign);
const certificatePromise = fsReadFile('./src/certificates/oauth2.key');

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

    const errorUrl = new url.URL(redirectUri);
    errorUrl.hash = params.toString();

    return errorUrl.toString();
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

exports.validateClient = function(clientId, redirectUri) {
    if (clientId === 'rester' && redirectUri === 'http://localhost:3000/test') {
        return true;
    }

    return false;
};

exports.getErrorRedirectUrl = function(
    oauth2Properties,
    error,
    errorDescription
) {
    if (oauth2Properties.responseType === 'token') {
        return getFragmentErrorUrl({
            redirectUri: oauth2Properties.redirectUri,
            error,
            errorDescription,
            state: oauth2Properties.state
        });
    } else {
        return getQueryErrorUrl({
            redirectUri: oauth2Properties.redirectUri,
            error,
            errorDescription,
            state: oauth2Properties.state
        });
    }
};

exports.getSuccessRedirectUrl = async function(oauth2Properties, userId) {
    if (oauth2Properties.responseType === 'token') {
        const { accessToken, expiresIn } = await exports.generateAccessToken(
            userId,
            oauth2Properties.clientId
        );

        return getFragmentAccessTokenUrl({
            redirectUri: oauth2Properties.redirectUri,
            accessToken,
            tokenType: 'urn:ietf:params:oauth:token-type:jwt',
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
        issuer: 'https://rester.com',
        subject: userId
    };

    const certificate = await certificatePromise;
    const token = await jwtSign(payload, certificate, options);

    return {
        accessToken: token,
        expiresIn: 86400
    };
};
