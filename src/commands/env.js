const utils = require('../utils');

var env = (context, version, key, value) => {
  if (value !== undefined) {
    key = key.toUpperCase();
    return utils.checkCredentials()
      .then(() => utils.getLinkedApp())
      .then((app) => {
        var url = '/apps/' + app.id + '/versions/' + version + '/environment';
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
        context.line('');
        context.line('Environment updated! Try viewing it with `zapier env ${version}`.');
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
env.argSpec = [
  {name: 'version', example: '1.0.0', required: true},
  {name: 'key', example: 'API_KEY'},
  {name: 'value', example: '1234567890', requiredWith: ['key']},
];
env.argOptsSpec = {};
env.help = 'Read and write environment variables.';
env.example = 'zapier env 1.0.0 API_KEY 1234567890';
env.docs = `\
Manage the environment of your app so that \`process.env\` can access the keys, making it easy to match a local environment with working environment via \`API_KEY=1234567890 npm test\`.

**Options**

* _none_ -- print a table of all environment variables, regardless of app version
* \`1.0.0\` -- the app version's environment to work on
* \`KEY\` -- the uppercase key of the environment variable to set
* \`VALUE\` -- the raw value to set to the key
${utils.defaultArgOptsFragment({cmd: 'env'})}

${'```'}bash
$ zapier env 1.0.0
# The env of your "Example" listed below.
# 
# ┌─────────┬─────────┬────────────┐
# │ Version │ Key     │ Value      │
# ├─────────┼─────────┼────────────┤
# │ 1.0.0   │ API_KEY │ 1234567890 │
# └─────────┴─────────┴────────────┘
# 
# Try setting an env with the \`zapier env 1.0.0 API_KEY 1234567890\` command.

$ zapier env 1.0.0 API_KEY 1234567890
# Preparing to set environment API_KEY for your 1.0.0 "Example".
# 
#   Setting API_KEY to "1234567890" - done!
# 
# Environment updated! Try viewing it with \`zapier env 1.0.0\`.
${'```'}
`;

module.exports = env;
