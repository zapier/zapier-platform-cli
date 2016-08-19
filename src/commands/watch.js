/*eslint no-unused-vars: 0 */
const path = require('path');
const colors = require('colors');
var nodeWatch = require('node-watch');

const utils = require('../utils');

const defaultPort = 7545;

const watch = (context) => {
  context.line('Watching and running locally.\n');

  const options = {
    log: context.line,
    port: context.argOpts.port || defaultPort,
    handler: utils.getLocalAppHandler(),
  };

  const orgVersion = require(path.join(process.cwd(), 'package.json')).version;
  const checkHandler = () => {
    options.handler({command: 'definition'}, {}, (err, resp) => {
      utils.printDone();
      if (err) { throw err; }
      const definition = resp.results;
      if (definition.version !== orgVersion) {
        context.line(colors.yellow(`  Warning! Version changed from ${orgVersion} to ${definition.version}! You need to restart watch to do that.`));
      }
    });
  };

  checkHandler();

  nodeWatch(process.cwd(), {}, (filePath) => {
    const fileName = filePath.replace(process.cwd() + '/', '');
    utils.printStarting(`Reloading for ${fileName}`);
    options.handler = utils.getLocalAppHandler(true);
    checkHandler();
  });

  // TODO: check we've pushed the current versions.

  return utils.checkCredentials()
    .then(() => utils.getLinkedApp())
    .then((app) => {
      utils.printStarting('Starting local server');
      return Promise.all([
        app,
        utils.localAppRPCServer(options)
      ]);
    })
    .then(([app, server]) => {
      utils.printDone();
      utils.printStarting('Starting local tunnel');
      return Promise.all([
        app,
        server,
        utils.makeTunnelUrl(options.port)
      ]);
    })
    .then(([app, server, proxyUrl]) => {
      utils.printDone();

      context.line();
      context.line('Running! Make changes and see them reflect almost instantly in the editor.');
      context.line();

      const loop = () => {
        const url = `/apps/${app.id}/versions/${orgVersion}/rpc-proxy`;
        return utils.callAPI(url, {method: 'PUT', body: {url: proxyUrl}});
      };
      return utils.promiseForever(loop, 15000);
    });
};
watch.argsSpec = [];
watch.argOptsSpec = {
  port: {help: 'what port should we host/listen for tunneling', default: defaultPort},
};
watch.help = 'Watch the current project.';
watch.example = 'zapier watch';
watch.docs = `\
Watches the project.

**Arguments**

${utils.argsFragment(watch.argsSpec)}
${utils.argOptsFragment(watch.argOptsSpec)}
${utils.defaultArgOptsFragment()}

${'```'}bash
$ zapier watch
${'```'}
`;

module.exports = watch;
