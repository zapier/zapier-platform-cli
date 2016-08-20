const utils = require('../utils');

const apps = (context) => {
  return utils.listApps()
    .then((data) => {
      context.line('All apps listed below.\n');
      utils.printData(data.apps, [
        ['Title', 'title'],
        ['Unique Slug', 'key'],
        ['Timestamp', 'date'],
        ['Linked', 'linked'],
      ]);
      if (!data.apps.length) {
        context.line('\nTry adding an app with the `zapier create` command.');
      } else {
        context.line('\nTry linking the current directory to a different app with the `zapier link` command.');
      }
    });
};
apps.argsSpec = [];
apps.argOptsSpec = {};
apps.help = 'Lists all the apps you can access.';
apps.example = 'zapier apps';
apps.docs = `\
Lists any apps that you have admin access to. Also checks for the current directory for a linked app, which you can control with \`zapier link\`.

**Arguments**

${utils.argsFragment(apps.argsSpec)}
${utils.argOptsFragment(apps.argOptsSpec)}
${utils.defaultArgOptsFragment()}

${'```'}bash
$ zapier apps
# All apps listed below.
# 
# ┌─────────┬───────────-─┬─────────────────────┬────────┐
# │ Title   │ Unique Slug │ Timestamp           │ Linked │
# ├─────────┼───────────-─┼─────────────────────┼────────┤
# │ Example │ Example     │ 2016-01-01T22:19:28 │ ✔      │
# └─────────┴───────────-─┴─────────────────────┴────────┘
# 
# Try linking the current directory to a different app with the \`zapier link\` command.
${'```'}
`;

module.exports = apps;
