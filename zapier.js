#!/usr/bin/env node
if (!global.Promise) {
  require('es6-promise').polyfill();
}
var entry = require('./lib/entry');
entry(process.argv);
