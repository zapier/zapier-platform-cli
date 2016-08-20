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
  const promise = new Promise((rs, rj) => {
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

const isValidAppInstall = (command) => {
  if (command === 'help' || command === 'init' || command === 'auth') {
    return true;
  }

  let packageJson;
  try {
    packageJson = require(path.join(process.cwd(), 'package.json'));
  } catch(err) {
    return false;
  }

  // try skipping the CLI itself
  const CLIpackageJson = require(path.join(__dirname, '../../package.json'));
  if (_.isEqual(packageJson, CLIpackageJson)) {
    return true;
  }

  const dependencies = packageJson.dependencies || {};
  if (!dependencies[PLATFORM_PACKAGE]) {
    return false;
  }

  try {
    require(`${process.cwd()}/node_modules/${PLATFORM_PACKAGE}`);
  } catch(err) {
    return false;
  }

  return true;
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

/* Delay a promise, by just a bit. */
const promiseDelay = (delay = 1000) => {
  return () => new Promise(resolve => {
    setTimeout(() => resolve(), delay);
  });
};

/* Never stop looping. */
const promiseForever = (action, delay = 1000) => {
  const loop = () => action().then(promiseDelay(delay)).then(loop);
  return loop();
};

module.exports = {
  camelCase,
  snakeCase,
  makePromise,
  runCommand,
  isValidNodeVersion,
  isValidAppInstall,
  npmInstall,
  promiseDoWhile,
  promiseForever
};
