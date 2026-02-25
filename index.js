// This file acts as a proxy for the actual dist output.
// Certain hosting environments (like Hostinger) default to looking for `index.js` at the root.

const fs = require('fs');
function logError(err) {
    fs.writeFileSync('./hostinger-error.log', new Date().toISOString() + ' ' + (err.stack || err) + '\n', { flag: 'a' });
}
process.on('uncaughtException', logError);
process.on('unhandledRejection', logError);

let app;
try {
    app = require('./dist/index.js').default || require('./dist/index.js').app;
} catch (err) {
    logError(err);
}
module.exports = app;
