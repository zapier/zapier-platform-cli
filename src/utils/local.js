const _ = require('lodash');
const colors = require('colors');
const path = require('path');
const jayson = require('jayson');

const {PLATFORM_PACKAGE} = require('../constants');

const {makePromise} = require('./misc');
const {promisify} = require('./promisify');

const makeTunnelUrl = promisify(require('ngrok').connect);

const getLocalAppHandler = (reload = false) => {
  const entryPath = `${process.cwd()}/index`;
  const rootPath = path.dirname(require.resolve(entryPath));
  if (reload) {
    Object.keys(require.cache).map((cachePath) => {
      if (cachePath.startsWith(rootPath)) {
        delete require.cache[cachePath];
      }
    });
  }
  const appRaw = require(entryPath);
  const zapier = require(`${rootPath}/node_modules/${PLATFORM_PACKAGE}`);
  const handler = zapier.exposeAppHandler(appRaw);
  return (event, ctx, callback) => {
    event = _.extend({}, event, {
      calledFromCli: true,
      doNotMonkeyPatchPromises: true // can drop this
    });
    handler(event, _, callback);
  };
};

// Runs a local app command (./index.js) like {command: 'validate'};
const localAppCommand = (event) => {
  const handler = getLocalAppHandler();
  const promise = makePromise();
  handler(event, {}, (err, resp) => promise.callback(err, resp.results));
  return promise;
};

// Stands up a local RPC server for app commands.
const localAppRPCServer = (options) => {

  const server = jayson.server({
    test: (args, callback) => {
      callback(null, {'results': 'Success!'});
    },
    invoke: (args, callback) => {
      let [event] = args;
      options.log(colors.green(colors.bold('==Input')));
      options.log(JSON.stringify(event));
      options.handler(event, {}, (err, resp) => {
        options.log(colors.red(colors.bold('==Output')));
        options.log(JSON.stringify(resp));
        options.log();
        callback(err, resp);
      });
    }
  });

  server.httpServer = server.http();
  server.httpServer.listen(options.port);

  return server;
};

module.exports = {
  makeTunnelUrl,
  getLocalAppHandler,
  localAppCommand,
  localAppRPCServer,
};
