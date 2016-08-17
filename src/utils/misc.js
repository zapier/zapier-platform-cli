const cp = require('child_process');

const _ = require('lodash');
const colors = require('colors/safe');
const path = require('path');
const fse = require('fs-extra');

const {PLATFORM_PACKAGE} = require('../constants');

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
    if (result.stdout) {
      result.stdout.on('data', (data) => {
        stdout += data.toString();
        if (global.argOpts.debug) {
          console.log(colors.green(stdout));
        }
      });
    }

    let stderr = '';
    if (result.stderr) {
      result.stderr.on('data', (data) => {
        stderr += data.toString();
        if (global.argOpts.debug) {
          console.log(colors.red(stdout));
        }
      });
    }

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

const parseVersions = (versionString) => (
  versionString.split('.').map(s => parseInt(s, 10))
);

const isValidNodeVersion = () => {
  const nvmrc = path.resolve(__dirname, '../../.nvmrc');
  const nvmVersion = fse.readFileSync(nvmrc, 'utf8').substr(1); // strip of leading 'v'

  const [nvmMajor, nvmMinor, nvmPatch] = parseVersions(nvmVersion);
  const [major, minor, patch] = parseVersions(process.versions.node);

  return (
    (major > nvmMajor) ||
    (major === nvmMajor && minor > nvmMinor) ||
    (major === nvmMajor && minor === nvmMinor && patch >= nvmPatch)
  );
};

const npmInstall = (appDir) => {
  return runCommand('npm', ['install'], {cwd: appDir});
};

/*
  Promise do-while loop. Executes promise returned by action,
  passing result to stop function. Keeps running action until
  stop returns falsey. Action is always run at least once.
 */
const promiseDoWhile = (action, stop) => {
  const loop = () => (
    action().then(result => stop(result) ? result : loop())
  );
  return loop();
};

module.exports = {
  camelCase,
  snakeCase,
  makePromise,
  runCommand,
  localAppCommand,
  isValidNodeVersion,
  npmInstall,
  promiseDoWhile
};
