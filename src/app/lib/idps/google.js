'use strict';

const Issuer = require('openid-client').Issuer;
const base64url = require('base64url');

module.exports = async function({ clientId, clientSecret }) {
    const issuer = await Issuer.discover('https://accounts.google.com');
    const client = new issuer.Client({
        client_id: clientId,
        client_secret: clientSecret,
        // Since 2018-04-12 client_secret_basic always returns:
        //   invalid_request
        //   Could not determine client ID from request.
        // Using client_secret_post instead.
        token_endpoint_auth_method: 'client_secret_post'
    });
    client.CLOCK_TOLERANCE = 5;
    const redirectUri = 'http://localhost:3000/sts/callback/oauth2/google';

    return {
        name: 'google',
        displayName: 'Google',

        getAuthorizeUrl(state) {
            return client.authorizationUrl({
                redirect_uri: redirectUri,
                scope: 'openid email profile',
                access_type: 'online',
                state: state
            });
        },

        async exchangeCodeIntoToken(code) {
            const tokenSet = await client.authorizationCallback(redirectUri, {
                code
            });

            return tokenSet.id_token;
        },

        async getUserProfile(token) {
            const parts = token.split('.');
            const payload = JSON.parse(base64url.decode(parts[1]));

            return {
                id: payload.sub,
                email: payload.email,
                givenName: payload.given_name,
                familyName: payload.family_name,
                displayName: payload.name,
                pictureUrl: payload.picture
            };
        }
    };
};
