'use strict';

const path = require('path');

const express = require('express');

const render = require('../utils/render');

const router = express.Router(); // eslint-disable-line new-cap

// Index
router.get('/', (req, res) => {
    render(res, 'index');
});

// Static files
const staticOptions = {
    //maxAge: 31536000000 // One year
};
router.use(
    '/static',
    express.static(path.resolve(__dirname, '../static'), staticOptions)
);

module.exports = router;
