'use strict';

const express = require('express');

const idps = require('./idps/all');
const stateUtils = require('./utils/state');


const router = express.Router(); // eslint-disable-line new-cap

router.get('/', function (req, res, next) {
    stateUtils.getRequiredState(req.query.state).then(state => {
        res.render('sts/login', {
            title: 'RESTer - Login',
            idps: Object.values(idps).map(idp => ({
                name: idp.displayName,
                url: idp.getAuthorizeUrl(state.id)
            }))
        });
    }, next);
});

module.exports = router;
