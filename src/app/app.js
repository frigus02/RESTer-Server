'use strict';

const path = require('path');

const express = require('express');
const es6Renderer = require('express-es6-template-engine');
const bunyan = require('bunyan');
const bunyanMiddleware = require('bunyan-middleware');
const bodyParser = require('body-parser');

const app = express();
const logger = bunyan.createLogger({ name: 'RESTer' });

app.engine('html', es6Renderer);
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'html');

app.use(
    bunyanMiddleware({
        logger: logger
    })
);

app.use(require('./middleware/https-redirect'));
app.use(
    require('./middleware/mongo-db')({
        url: process.env.RESTER_MONGO_DB_URL,
        dbName: process.env.RESTER_MONGO_DB_NAME
    })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', require('./routes'));

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
