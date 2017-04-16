'use strict';

const path = require('path');

const express = require('express');
const bunyan = require('bunyan');
const bunyanMiddleware = require('bunyan-middleware');
const bodyParser = require('body-parser');


const app = express();
const logger = bunyan.createLogger({ name: 'RESTer' });

app.engine('ntl', require('./utils/ntl-template-engine'));
app.set('views', path.join(__dirname, '..', 'site'));
app.set('view engine', 'ntl');

app.use(bunyanMiddleware({
    logger: logger
}));

app.use(require('./middleware/https-redirect'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', require('./routes/index'));

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
