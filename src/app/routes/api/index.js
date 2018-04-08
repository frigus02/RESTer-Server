'use strict';

const express = require('express');

const router = express.Router(); // eslint-disable-line new-cap

router.use('/users', require('./users'));

module.exports = router;
