const _ = require('lodash');

const {PLATFORM_PACKAGE} = require('../constants');

const {makePromise} = require('./misc');
const {promisify} = require('./promisify');
const jayson = require('jayson');

const makeTunnelUrl = promisify(require('ngrok').connect);

const getLocalAppHandler = () => {
  var appRaw = require(`${process.cwd()}/index`);
  var zapier = require(`${process.cwd()}/node_modules/${PLATFORM_PACKAGE}`);
  var handler = zapier.exposeAppHandler(appRaw);
  return handler;
};

// Runs a local app command (./index.js) like {command: 'validate'};
const localAppCommand = (event) => {
  const handler = getLocalAppHandler();
  var promise = makePromise();
  event = _.extend({}, event, {
    calledFromCli: true,
    doNotMonkeyPatchPromises: true // can drop this
  });
  handler(event, {}, (err, resp) => promise.callback(err, resp.results));
  return promise;
};

// Stands up a local RPC server for app commands.
const localAppRPCServer = (port, handler) => {
  handler = handler || getLocalAppHandler();

  const server = jayson.server({
    test: (args, callback) => {
      callback(null, {'results': 'Success!'});
    },
    invoke: (args, callback) => {
      console.log(args);
      let [event] = args;
      event = _.extend({}, event, {
        calledFromCli: true,
      });
      handler(event, {}, (err, resp) => {
        callback(err, resp);
      });
    }
  });

  server.httpServer = server.http();
  server.httpServer.listen(port);

  return server;
};

module.exports = {
  makeTunnelUrl,
  getLocalAppHandler,
  localAppCommand,
  localAppRPCServer,
};
