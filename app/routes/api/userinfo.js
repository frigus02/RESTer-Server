'use strict';

const express = require('express');

const users = require('../../data/users');

const router = express.Router(); // eslint-disable-line new-cap

router.get('/', async function(req, res) {
    const user = await users.get(req.$.db, req.user.sub, users.projection.user);
    res.json(user);
});

router.put('/', async function(req, res) {
    await users.update(req.$.db, req.user.sub, req.body);
    res.send(200);
});

module.exports = router;
