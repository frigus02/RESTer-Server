'use strict';

exports.getCallbackUrl = function(req, idp) {
    const origin = `${req.protocol}://${req.get('host')}`;
    return `${origin}/sts/callback/oauth2/${idp.name}`;
};
