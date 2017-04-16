'use strict';

const express = require('express');


const router = express.Router(); // eslint-disable-line new-cap

router.use('/', require('./site'));
router.use('/api', require('./api/index'));
router.use('/sts', require('./sts/index'));

module.exports = router;
