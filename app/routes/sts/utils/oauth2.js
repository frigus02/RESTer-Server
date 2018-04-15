'use strict';

exports.getCallbackUrl = function(req, idp) {
    const origin = `${req.protocol}://${req.get('host')}`;
    return `${origin}/sts/callback/oauth2/${idp.name}`;
};

exports.validateClient = function(req, clientId, redirectUri) {
    const origin = `${req.protocol}://${req.get('host')}`;
    return clientId === 'rester' && redirectUri === origin;
};

exports.validateClientAuth = function(clientId, clientSecret) {
    return clientId === 'rester' && clientSecret === 'fk6GtWcmJZKx6N6u';
};
