// This file acts as a proxy for the actual dist output.
// Certain hosting environments (like Hostinger) default to looking for `index.js` at the root.

const app = require('./dist/index.js').default || require('./dist/index.js').app;
module.exports = app;
