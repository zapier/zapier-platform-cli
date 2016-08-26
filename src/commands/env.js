const utils = require('../utils');

const env = (context, version, key, value) => {
  if (value !== undefined) {
    key = key.toUpperCase();
    return utils.checkCredentials()
      .then(() => utils.getLinkedApp())
      .then((app) => {
        const url = '/apps/' + app.id + '/versions/' + version + '/environment';
        context.line(`Preparing to set environment ${key} for your ${version} "${app.title}".\n`);
        utils.printStarting(`Setting ${key} to "${value}"`);
        return utils.callAPI(url, {
          method: 'PUT',
          body: {
            key: key,
            value: value
          }
        });
      })
      .then(() => {
        utils.printDone();
        context.line();
        context.line('Environment updated! Try viewing it with `zapier env ${version}`.');
        // TODO: touch index.js to reload watch?
        return;
      });
  }
  if (key) {
    context.line(`Try viewing your env with \`zapier env\` or setting with \`${env.example}\`.`);
    return Promise.resolve();
  }
  return utils.listEnv(version)
    .then((data) => {
      context.line(`The env of your "${data.app.title}" listed below.\n`);
      utils.printData(data.environment, [
        ['Version', 'app_version'],
        ['Key', 'key'],
        ['Value', 'value'],
      ]);
      context.line(`\nTry setting an env with the \`${env.example}\` command.`);
    });
};
env.argsSpec = [
  {name: 'version', example: '1.0.0', required: true, help: 'the app version\'s environment to work on'},
  {name: 'key', example: 'CLIENT_SECRET', help: 'the uppercase key of the environment variable to set'},
  {name: 'value', example: '12345', requiredWith: ['key'], help: 'the raw value to set to the key'},
];
env.argOptsSpec = {};
env.help = 'Read and write environment variables.';
env.example = 'zapier env 1.0.0 CLIENT_SECRET 12345';
env.docs = `\
Manage the environment of your app so that \`process.env\` can access the keys, making it easy to match a local environment with working environment via \`CLIENT_SECRET=12345 npm test\`.

**Arguments**

* _none_ -- print a table of all environment variables, regardless of app version
${utils.argsFragment(env.argsSpec)}
${utils.defaultArgOptsFragment()}

${'```'}bash
$ zapier env 1.0.0
# The env of your "Example" listed below.
# 
# ┌─────────┬─────────┬────────────┐
# │ Version │ Key     │ Value      │
# ├─────────┼─────────┼────────────┤
# │ 1.0.0   │ CLIENT_SECRET │ 12345 │
# └─────────┴─────────┴────────────┘
# 
# Try setting an env with the \`zapier env 1.0.0 CLIENT_SECRET 12345\` command.

$ zapier env 1.0.0 CLIENT_SECRET 12345
# Preparing to set environment CLIENT_SECRET for your 1.0.0 "Example".
# 
#   Setting CLIENT_SECRET to "12345" - done!
# 
# Environment updated! Try viewing it with \`zapier env 1.0.0\`.
${'```'}
`;

module.exports = env;
