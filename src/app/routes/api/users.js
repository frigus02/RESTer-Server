'use strict';

const express = require('express');


const router = express.Router(); // eslint-disable-line new-cap

router.get('/', function (req, res) {
    res.json([
        { id: 1, name: 'jan' },
        { id: 2, name: 'peter' }
    ]);
});

module.exports = router;
