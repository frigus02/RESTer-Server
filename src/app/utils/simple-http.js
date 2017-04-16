'use strict';

const http = require('http');
const https = require('https');
const url = require('url');


/**
 * Executes the specified HTTP request.
 * @param {Object} request - The request object.
 * @param {String} request.method - The HTTP method like GET or POST.
 * @param {String} request.url - The url.
 * @param {Object} request.headers - The headers.
 * @param {String} request.body - The body.
 * @returns {Promise.<Object>} A promise which gets resolved, when the request
 * was successful and returns the request response.
 */
module.exports = function (request) {
    const requestUrl = new url.URL(request.url);
    const client = requestUrl.protocol === 'https:' ? https : http;
    const options = {
        method: request.method,
        hostname: requestUrl.hostname,
        port: requestUrl.port,
        path: requestUrl.pathname,
        headers: request.headers
    };

    return new Promise((resolve, reject) => {
        const req = client.request(options, res => {
            res.setEncoding('utf8');

            res.body = '';
            res.on('data', chunk => {
                res.body += chunk;
            });

            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    headers: res.headers,
                    body: res.body
                });
            });
        });

        req.on('error', err => {
            reject(err);
        });

        if (request.body) {
            req.write(request.body);
        }

        req.end();
    });
};
