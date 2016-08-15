const cp = require('child_process');

const _ = require('lodash');
const colors = require('colors/safe');

const {PLATFORM_PACKAGE, MIN_NODE_VERSION} = require('../constants');

const camelCase = (str) => _.capitalize(_.camelCase(str));
const snakeCase = (str) => _.snakeCase(str);

// Returns a promise that assists "callback to promise" conversions.
const makePromise = () => {
  let resolve, reject;
  var promise = new Promise((rs, rj) => {
    resolve = rs;
    reject = rj;
  });
  promise.callback = (err, ...args) => {
    if (err) {
      reject(err);
    } else {
      resolve(...args);
    }
  };
  return promise;
};

// Run a bash command with a promise.
const runCommand = (command, args, options) => {
  options = options || {};
  if (global.argOpts.debug) {
    console.log('\n');
    console.log(`Running ${colors.bold(command + args.join(' '))} command in ${colors.bold(options.cwd || process.cwd())}:\n`);
  }
  return new Promise((resolve, reject) => {
    const result = cp.spawn(command, args, options);

    let stdout = '';
    result.stdout.on('data', (data) => {
      stdout += data.toString();
      if (global.argOpts.debug) {
        console.log(colors.green(stdout));
      }
    });

    let stderr = '';
    result.stderr.on('data', (data) => {
      stderr += data.toString();
      if (global.argOpts.debug) {
        console.log(colors.red(stdout));
      }
    });

    result.on('error', reject);

    result.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr));
      }
      resolve(stdout);
    });
  });
};

// Runs a local app command (./index.js) like {command: 'validate'};
const localAppCommand = (event) => {
  var appRaw = require(`${process.cwd()}/index`);
  var zapier = require(`${process.cwd()}/node_modules/${PLATFORM_PACKAGE}`);
  var handler = zapier.exposeAppHandler(appRaw);
  var promise = makePromise();
  event = _.extend({}, event, {
    calledFromCli: true,
    doNotMonkeyPatchPromises: true // can drop this
  });
  handler(event, {}, (err, resp) => promise.callback(err, resp.results));
  return promise;
};

const isValidNodeVersion = () => {
  const versions = process.versions.node.split('.').map(s => parseInt(s, 10));
  const major = versions[0];
  const minor = versions[1];
  const patch = versions[2];
  return (
    (major > MIN_NODE_VERSION.major) ||
    (major === MIN_NODE_VERSION.major && minor > MIN_NODE_VERSION.minor) ||
    (major === MIN_NODE_VERSION.major && minor === MIN_NODE_VERSION.minor && patch >= MIN_NODE_VERSION.patch)
  );
};

const npmInstall = (appDir) => {
  return runCommand('npm', ['install'], {cwd: appDir});
};

module.exports = {
  camelCase,
  snakeCase,
  makePromise,
  runCommand,
  localAppCommand,
  isValidNodeVersion,
  npmInstall
};
