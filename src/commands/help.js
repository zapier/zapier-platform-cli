const _ = require('lodash');

const constants = require('../constants');
const utils = require('../utils');

const help = (context, cmd) => {
  const commands = require('./index');

  if (commands[cmd] && commands[cmd].docs) {
    context.line(commands[cmd].help);
    context.line();
    context.line(`Usage: \`${commands[cmd].example}\``);
    context.line();
    utils.markdownLog(commands[cmd].docs.trim());
    return Promise.resolve();
  }
  context.line('Usage: zapier COMMAND [command-specific-arguments] [--command-specific-options]'.trim());
  return Promise.resolve()
    .then(() => {
      context.line();
      const allCommands = _.orderBy(Object.keys(commands))
        .map((name) => {
          return {
            name,
            help: commands[name].help,
            example: commands[name].example
          };
        });
      utils.printData(allCommands, [
        ['Command', 'name'],
        ['Example', 'example'],
        ['Help', 'help'],
      ]);
    });
};
help.argsSpec = [
  {name: 'cmd', help: 'the command to view docs for'}
];
help.argOptsSpec = {};
help.help = 'Lists all the commands you can use.';
help.example = 'zapier help [command]';
help.docs = `\
Prints documentation to the terminal screen.

Generally - the \`zapier\` command works off of two files:

 * ${constants.AUTH_LOCATION}      (home directory identifies the deploy key & user)
 * ./${constants.CURRENT_APP_FILE}   (current directory identifies the app)

The \`zapier auth\` and \`zapier register "Example"\` or \`zapier link\` commands will help manage those files. All commands listed below.

**Arguments**

* _none_ -- print all commands
${utils.argsFragment(help.argsSpec)}
${utils.defaultArgOptsFragment()}

${'```'}bash
$ zapier help apps
$ zapier help scaffold
$ zapier help
# Usage: zapier COMMAND [command-specific-arguments] [--command-specific-options]
# 
# This Zapier command works off of two files:
# 
#  * ~/.zapierrc      (home directory identifies the deploy key & user)
#  * ./.zapierapprc   (current directory identifies the app)
# 
# The \`zapier auth\` and \`zapier init\`/\`zapier link\` commands will help manage those files. All commands listed below.
# 
# ┌─────────────┬───────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────┐
# │ Command     │ Example                               │ Help                                                                       │
# ├─────────────┼───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
# │ apps        │ zapier apps                           │ Lists all the apps you can access.                                         │
# │ auth        │ zapier auth                           │ Configure your \`/Users/username/.zapierrc\` with a deploy key.              │
# │ build       │ zapier build                          │ Builds a deployable zip from the current directory.                        │
# │ collaborate │ zapier collaborate [user@example.com] │ Manage the collaborators on your project. Can optionally --remove.         │
# │ deploy      │ zapier deploy 1.0.0                   │ Deploys a specific version to a production.                                │
# │ deprecate   │ zapier deprecate 1.0.0 2017-01-20     │ Mark a non-production version of your app as deprecated by a certain date. │
# │ describe    │ zapier describe                       │ Describes the current app.                                                 │
# │ env         │ zapier env 1.0.0 API_KEY 1234567890   │ Read and write environment variables.                                      │
# │ help        │ zapier help [command]                 │ Lists all the commands you can use.                                        │
# │ history     │ zapier history                        │ Prints all recent history for your app.                                    │
# │ init        │ zapier init [location]                │ Initializes a new zapier app in a directory.                               │
# │ invite      │ zapier invite [user@example.com]      │ Manage the invitees/testers on your project. Can optionally --remove.      │
# │ link        │ zapier link                           │ Link the current directory to an app you have access to.                   │
# │ logs        │ zapier logs                           │ Prints recent logs. See help for filter arguments.                         │
# │ migrate     │ zapier migrate 1.0.0 1.0.1 [10%]      │ Migrate users from one version to another.                                 │
# │ push        │ zapier push                           │ Build and upload a new version of the current app - does not deploy.       │
# │ register    │ zapier register "Example" [directory] │ Registers a new app in your account.                                       │
# │ scaffold    │ zapier scaffold model "Contact"       │ Adds a sample model, trigger, action or search to your app.                │
# │ test        │ zapier test                           │ Tests your app via \`npm test\`.                                             │
# │ upload      │ zapier upload                         │ Upload the last build as a version.                                        │
# │ validate    │ zapier validate                       │ Validates the current project.                                             │
# │ versions    │ zapier versions                       │ Lists all the versions of the current app.                                 │
# │ watch       │ zapier watch                          │ Watch the current directory and send changes live to Zapier.               │
# └─────────────┴───────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────┘
${'```'}
`;

module.exports = help;
