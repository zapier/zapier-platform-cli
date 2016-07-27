const cp = require('child_process');

const _ = require('lodash');
const colors = require('colors/safe');

const constants = require('../constants');

const argParse = (argv) => {
  var args = [], opts = {};
  argv.forEach((arg) => {
    if (arg.startsWith('--')) {
      var key = arg.split('=', 1)[0].replace('--', '');
      var val = arg.split('=').slice(1).join('=');
      if (val === '') {
        val = true;
      } else if (val.toLowerCase() === 'false') {
        val = false;
      }
      opts[key] = val;
    } else {
      args.push(arg);
    }
  });
  return [args, opts];
};

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
  var zapier = require(`${process.cwd()}/node_modules/${constants.PLATFORM_PACKAGE}`);
  var handler = zapier.exposeAppHandler(appRaw);
  var promise = makePromise();
  event = _.extend({}, event, {
    calledFromCli: true,
    doNotMonkeyPatchPromises: true // can drop this
  });
  handler(event, {}, (err, resp) => promise.callback(err, resp.results));
  return promise;
};

module.exports = {
  argParse,
  camelCase,
  snakeCase,
  makePromise,
  runCommand,
  localAppCommand,
};
