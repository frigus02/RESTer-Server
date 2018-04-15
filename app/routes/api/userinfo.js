'use strict';

const express = require('express');

const users = require('../../data/users');

const router = express.Router(); // eslint-disable-line new-cap

router.get('/', async function(req, res) {
    const user = await users.get(req.$.db, req.user.sub, users.projection.user);
    res.json(user);
});

module.exports = router;
