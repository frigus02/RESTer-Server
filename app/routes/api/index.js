'use strict';

const express = require('express');
const jwt = require('express-jwt');

const oauth2 = require('../../lib/oauth2');

const router = express.Router(); // eslint-disable-line new-cap

router.use(
    jwt({
        secret: oauth2.publicKey,
        issuer: 'https://rester.kuehle.me'
    })
);

router.use('/v1/tokens', require('./tokens'));
router.use('/v1/userinfo', require('./userinfo'));

module.exports = router;
