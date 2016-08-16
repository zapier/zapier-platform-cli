#!/usr/bin/env node

const exampleApps = require('../lib/utils/example-apps');
const utils = require('../lib/utils');

if (process.argv.length !== 3) {
  console.error('delete-example: Deletes example app from S3.');
  console.error('Usage: npm run delete-example [S3_KEY]');

  /*eslint no-process-exit: 0 */
  process.exit(0);
}

const key = process.argv[2];

utils.printStarting(`Deleting ${key} from S3`);

exampleApps.remove(key).then(() => {
  utils.printDone();
  console.log('Delete successful');
}).catch(err => {
  utils.printDone(false);
  console.error('Error deleting:', err);
});
