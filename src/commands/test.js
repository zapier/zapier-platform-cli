const _ = require('lodash');
const utils = require('../utils');

const test = (context) => {
  const extraEnv = {};
  if (!global.argOpts['disable-log-to-stdout']) {
    extraEnv.LOG_TO_STDOUT = 'true';
  }
  if (global.argOpts['detailed-log-to-stdout']) {
    extraEnv.DETAILED_LOG_TO_STDOUT = 'true';
  }

  const env = _.extend({}, process.env, extraEnv);
  return utils.runCommand('npm', ['run', '--silent', 'test'], {stdio: 'inherit', env})
    .then((stdout) => {
      if (stdout) {
        context.line(stdout);
      }
    });
};
test.argsSpec = [
];
test.argOptsSpec = {
  'disable-log-to-stdout': {flag: true, help: 'disables print zapier summary logs to standard out'},
  'detailed-log-to-stdout': {flag: true, help: 'print zapier detailed logs to standard out'}
};
test.help = 'Tests your app via `npm test`.';
test.example = 'zapier test';
test.docs = `\
This command is effectively the same as \`npm test\` (which we normally recommend mocha tests) - except we can wire in some custom tests to validate your app.

**Arguments**

${utils.argsFragment(test.argsSpec)}
${utils.argOptsFragment(test.argOptsSpec)}

${'```'}bash
$ zapier test
#
#   app
#     validation
#       ✓ should be a valid app
#
#   triggers
#     hello world
#       ✓ should load fine (777ms)
#
#   2 passing (817ms)
#
${'```'}
`;

module.exports = test;
