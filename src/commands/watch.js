const utils = require('../utils');

const defaultPort = 7545;

const watch = (context) => {
  context.line('Watching and running locally.\n');
  const port = context.argOpts.port || defaultPort;
  return utils.checkCredentials()
    .then(() => utils.getLinkedApp())
    .then((app) => {
      utils.printStarting('Starting local server');
      return Promise.all([
        app,
        utils.localAppRPCServer(port)
      ]);
    })
    .then(([app, server]) => {
      utils.printDone();
      utils.printStarting('Starting local tunnel');
      return Promise.all([
        app,
        server,
        utils.makeTunnelUrl(port)
      ]);
    })
    .then(([app, server, proxyUrl]) => {
      utils.printDone();
      utils.printStarting('Registering tunnel');
      // console.log(server);
      // console.log(url);
      const url = `/apps/${app.id}/rpc-proxy`;
      return utils.callAPI(url, {method: 'PUT', body: {url: proxyUrl}});
    })
    ;
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
