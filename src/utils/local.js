const _ = require('lodash');
const colors = require('colors');
const path = require('path');
const jayson = require('jayson');

const {PLATFORM_PACKAGE} = require('../constants');

const {prettyJSONstringify} = require('./display');
const {makePromise} = require('./misc');
const {promisify} = require('./promisify');

const makeTunnelUrl = promisify(require('ngrok').connect);

const getLocalAppHandler = ({reload = false, baseEvent = {}} = {}) => {
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
  const handler = zapier.createAppHandler(appRaw);
  return (event, ctx, callback) => {
    event = _.merge({}, event, {
      calledFromCli: true,
    }, baseEvent);
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
      options.log();
      options.log(colors.green('==Method'));
      options.log(event.method);
      options.log(colors.green('==Bundle'));
      options.log(prettyJSONstringify(event.bundle));
      options.handler(event, {}, (err, resp) => {
        if (err) {
          options.log(colors.red(colors.bold('==Error')));
          options.log(err.stack);
          options.log();
        } else {
          options.log(colors.red(colors.bold('==Results')));
          options.log(prettyJSONstringify(resp.results));
          options.log();
        }
        // TODO: this needs to somehow match how AWS returns its
        // errors - or we need to do it in zapier/zapier
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
