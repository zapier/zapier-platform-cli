#!/usr/bin/env node
require('es6-promise').polyfill();
var entry = require('./lib/entry');
entry(process.argv);
