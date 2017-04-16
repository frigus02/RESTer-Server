'use strict';

const Issuer = require('openid-client').Issuer;
const base64url = require('base64url');


const config = {
    clientId: process.env.RESTER_IDP_GOOGLE_CLIENT_ID,
    clientSecret: process.env.RESTER_IDP_GOOGLE_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/sts/callback/oauth2/google',
    scope: 'openid email profile'
};

let client;
Issuer.discover('https://accounts.google.com').then(googleIssuer => {
    client = new googleIssuer.Client({
        client_id: config.clientId,
        client_secret: config.clientSecret
    });
});

exports.name = 'google';
exports.displayName = 'Google';

exports.getAuthorizeUrl = function (state) {
    return client.authorizationUrl({
        redirect_uri: config.redirectUri,
        scope: config.scope,
        access_type: 'online',
        state: state
    });
};

exports.exchangeCodeIntoToken = function (code) {
    return client.authorizationCallback(config.redirectUri, {
        code: code
    }).then(tokenSet => tokenSet.id_token);
};

exports.getUserProfile = function (token) {
    const parts = token.split('.');
    const payload = JSON.parse(base64url.decode(parts[1]));

    return Promise.resolve({
        id: payload.sub,
        email: payload.email,
        givenName: payload.given_name,
        familyName: payload.family_name,
        displayName: payload.name,
        pictureUrl: payload.picture
    });
};

