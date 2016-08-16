#!/usr/bin/env node

const exampleApps = require('../lib/utils/example-apps');
const utils = require('../lib/utils');

utils.printStarting('Fetching example apps');

exampleApps.list().then(keys => {
  utils.printDone();
  console.log('\nExample apps:');
  utils.printData(keys, [['Key', 'Key']]);
}).catch(err => {
  utils.printDone(false);
  console.error('Error listing example apps:', err);
});
