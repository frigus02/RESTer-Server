'use strict';

const path = require('path');
const { URLSearchParams } = require('url');

const express = require('express');

const router = express.Router(); // eslint-disable-line new-cap

// Index
router.get('/', (req, res) => {
    const loginParams = new URLSearchParams();
    loginParams.set('response_type', 'token');
    loginParams.set('client_id', 'rester');
    loginParams.set('redirect_uri', `${req.protocol}://${req.get('host')}`);
    const loginUrl = `/sts/issue/oauth2/authorize?` + loginParams.toString();

    res.render('index', {
        loginUrl
    });
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
