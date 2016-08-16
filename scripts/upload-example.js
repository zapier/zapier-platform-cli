#!/usr/bin/env node

const exampleApps = require('../lib/utils/example-apps');
const utils = require('../lib/utils');

if (process.argv.length !== 4) {
  console.error('upload-example: Uploads example app zip to S3.');
  console.error('Usage: npm run upload-example [S3_KEY] [ZIP_FILE]');

  /*eslint no-process-exit: 0 */
  process.exit(0);
}

const key = process.argv[2];
const zipFile = process.argv[3];

utils.printStarting(`Uploading ${zipFile} to S3 key ${key}`);

exampleApps.upload(key, zipFile).then(() => {
  utils.printDone();
  console.log('Upload successful');
}).catch(err => {
  utils.printDone(false);
  console.error('Error uploading zip file:', err);
});
