'use strict';

const express = require('express');

const router = express.Router(); // eslint-disable-line new-cap

router.use('/', require('./site'));
router.use('/api', require('./api'));
router.use('/sts', require('./sts'));

module.exports = router;
