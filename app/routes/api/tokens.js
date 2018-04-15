'use strict';

const express = require('express');

const refreshTokens = require('../../data/sts-oauth2-refresh-tokens');

const router = express.Router(); // eslint-disable-line new-cap

router.get('/', async function(req, res) {
    const tokens = await refreshTokens.queryByUserId(req.$.db, req.user.sub);
    res.json(
        tokens.map(token => ({
            id: token._id,
            application: token.clientId
        }))
    );
});

router.delete('/:id', async function(req, res) {
    await refreshTokens.deleteForUser(req.$.db, req.user.sub, req.param('id'));
    res.send(200);
});

module.exports = router;
