const {
  writeFile,
  readFile,
  copyDir,
  ensureDir,
  removeDir,
} = require('./files');

const {
  markdownLog,
  makeTable,
  printData,
  prettyJSONstringify,
  clearSpinner,
  printStarting,
  printDone,
  getInput,
} = require('./display');

const {
  readCredentials,
  callAPI,
  writeLinkedAppConfig,
  getLinkedApp,
  checkCredentials,
  listApps,
  listEndoint,
  listVersions,
  listHistory,
  listCollaborators,
  listInvitees,
  listLogs,
  listEnv,
  upload,
} = require('./api');

const {
  argParse,
  camelCase,
  snakeCase,
  makePromise,
  runCommand,
  localAppCommand,
  isValidNodeVersion
} = require('./misc');

const {
  build,
  buildAndUploadCurrentDir,
} = require('./build');

module.exports = {
  markdownLog,
  makeTable,
  printData,
  argParse,
  prettyJSONstringify,
  clearSpinner,
  printStarting,
  printDone,
  makePromise,
  getInput,
  writeFile,
  readFile,
  copyDir,
  ensureDir,
  removeDir,
  readCredentials,
  runCommand,
  localAppCommand,
  isValidNodeVersion,
  callAPI,
  writeLinkedAppConfig,
  getLinkedApp,
  checkCredentials,
  listApps,
  listEndoint,
  listVersions,
  listHistory,
  listCollaborators,
  listInvitees,
  listLogs,
  listEnv,
  build,
  upload,
  buildAndUploadCurrentDir,
  camelCase,
  snakeCase,
};
