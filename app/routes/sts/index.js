'use strict';

const express = require('express');

const router = express.Router(); // eslint-disable-line new-cap

router.use('/issue/oauth2', require('./issue-oauth2'));
router.use('/callback/oauth2', require('./callback-oauth2'));
router.use('/login', require('./login'));
router.use('/register', require('./register'));

module.exports = router;
