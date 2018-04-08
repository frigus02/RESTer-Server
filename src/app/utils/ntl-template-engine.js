'use strict';

const fs = require('fs');

const hiddenKeys = ['settings', '_locals', 'cache'];
function filderHiddenKeys(key, value) {
    if (!hiddenKeys.includes(key)) {
        return value;
    }
}

module.exports = function(filePath, options, callback) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function(err, content) {
        if (err) {
            return callback(err);
        }

        const stateJson = JSON.stringify(options, filderHiddenKeys, 4);
        const stateScript = `<script>const state = ${stateJson};</script>`;
        const rendered = content.replace('#state#', stateScript);

        return callback(null, rendered);
    });
};
