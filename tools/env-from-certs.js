'use strict';

/* eslint-disable no-console */

const fs = require('fs');

fileToEnv('./new-oauth-cert.key', 'RESTER_OAUTH2_PRIVATE_KEY');
fileToEnv('./new-oauth-cert.crt', 'RESTER_OAUTH2_PUBLIC_KEY');

function fileToEnv(fileName, envName) {
    const contents = fs.readFileSync(fileName, 'utf8');
    const noNewLines = contents.replace(/[\n\r]+/g, '\\n');
    console.log(`${envName}="${noNewLines}"`);
}
