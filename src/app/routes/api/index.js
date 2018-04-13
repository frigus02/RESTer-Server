'use strict';

const express = require('express');
const jwt = require('express-jwt');

const oauth2 = require('../../lib/oauth2');

const router = express.Router(); // eslint-disable-line new-cap

router.use(jwt({ secret: oauth2.publicKey }));

router.use('/userinfo', require('./userinfo'));

module.exports = router;
