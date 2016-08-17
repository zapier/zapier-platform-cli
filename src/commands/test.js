const utils = require('../utils');

const test = (context) => {
  return utils.runCommand('npm', ['run', '--silent', 'test'], {stdio: 'inherit'})
    .then((stdout) => {
      if (stdout) {
        context.line(stdout);
      }
    });
};
test.argsSpec = [
];
test.argOptsSpec = {
};
test.help = 'Tests your app via `npm test`.';
test.example = 'zapier test';
test.docs = `\
This command is effectively the same as npm test (which we normally recommend mocha tests) - except we can wire in some custom tests to validate your app.

**Arguments**

${utils.argsFragment(test.argsSpec)}
${utils.argOptsFragment(test.argOptsSpec)}

${'```'}bash
$ zapier test
# > node_modules/mocha/bin/mocha
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
${'```'}
`;

module.exports = test;
