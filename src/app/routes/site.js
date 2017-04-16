'use strict';

const path = require('path');

const express = require('express');


const router = express.Router(); // eslint-disable-line new-cap

// Index
function serveSite(req, res) {
    res.render('index');
}

router.get('/', serveSite);
router.get('/view2', serveSite);
router.get('/view3', serveSite);

// Static files
const siteLocalPath = path.join(__dirname, '..', '..', 'site');
const staticFolders = ['bower_components', 'elements', 'images'];
const staticOptions = {
    //maxAge: 31536000000 // One year
};

for (let folder of staticFolders) {
    const folderBaseUrl = '/' + folder;
    const folderLocalPath = path.join(siteLocalPath, folder);
    router.use(folderBaseUrl, express.static(folderLocalPath, staticOptions));
}

// Service Worker
const swLocalPath = path.join(siteLocalPath, 'service-worker.js');
router.use('/service-worker.js', express.static(swLocalPath));

module.exports = router;
