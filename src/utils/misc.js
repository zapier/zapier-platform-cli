const cp = require('child_process');

const _ = require('lodash');

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
const runCommand = (command, options) => {
  options = options || {};
  return new Promise((resolve, reject) => {
    cp.exec(command, options, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      resolve({
        stdout: stdout,
        stderr: stderr
      });
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
