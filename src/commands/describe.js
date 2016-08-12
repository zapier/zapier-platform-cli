const colors = require('colors/safe');
const _ = require('lodash');

const utils = require('../utils');


const describe = (context) => {
  return Promise.resolve()
    .then(() => utils.localAppCommand({command: 'definition'}))
    .then((definition) => {
      context.line(`A description of your app "${definition.title}" listed below.\n`);

      // context.line(utils.prettyJSONstringify(definition));
      // TODO: auth and app title/description

      const types = ['triggers', 'searches', 'writes'];

      types.forEach((type) => {
        context.line(colors.bold(_.capitalize(type)) + '\n');
        const rows = _.values(definition[type]);
        const headers = [
          ['key', 'key'],
          ['noun', 'noun'],
          ['display.label', 'display.label'],
          ['operation.model', 'operation.model', colors.grey('n/a')],
          ['operation.perform', 'operation.perform'],
        ];
        const ifEmpty = colors.grey(`Nothing found for ${type}, maybe try the \`zapier scaffold\` command?`);
        utils.printData(rows, headers, ifEmpty);
        context.line('');
      });
      context.line('If you\'d like to add more, try the `zapier scaffold` command to kickstart!');
    });
};
describe.argsSpec = [];
describe.argOptsSpec = {};
describe.help = 'Describes the current app.';
describe.example = 'zapier describe';
describe.docs = `\
Prints a human readable enumeration of your app's triggers, searches and actions as seen by our system. Useful to understand how your models convert and relate to different actions.

**Options**

${utils.defaultArgOptsFragment({cmd: 'describe'})}

${'```'}bash
$ zapier describe
# A description of your app "Example" listed below.
# 
# Triggers
# 
# ┌─────────────┬──────────┬───────────────┬─────────────────┬───────────────────┐
# │ key         │ noun     │ display.label │ operation.model │ operation.perform │
# ├─────────────┼──────────┼───────────────┼─────────────────┼───────────────────┤
# │ hello_world │ Greeting │ New Greeting  │ n/a             │ $func$2$f$        │
# └─────────────┴──────────┴───────────────┴─────────────────┴───────────────────┘
# 
# Searches
# 
#  Nothing found for searches, maybe try the \`zapier scaffold\` command?
# 
# Writes
# 
#  Nothing found for writes, maybe try the \`zapier scaffold\` command?
# 
# If you'd like to add more, try the \`zapier scaffold\` command to kickstart!
${'```'}
`;

module.exports = describe;
