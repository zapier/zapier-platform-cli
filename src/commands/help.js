const constants = require('../constants');
const utils = require('../utils');

var help = (context, cmd) => {
  const commands = require('./index');

  if (commands[cmd] && commands[cmd].docs) {
    context.line(commands[cmd].help);
    context.line();
    context.line(`Usage: \`${commands[cmd].example}\``);
    context.line();
    utils.markdownLog(commands[cmd].docs.trim());
    return Promise.resolve();
  }
  context.line(`
Usage: zapier COMMAND [command-specific-arguments] [--command-specific-options]

This Zapier command works off of two files:

 * ${constants.AUTH_LOCATION}      (home directory identifies the deploy key & user)
 * ./${constants.CURRENT_APP_FILE}   (current directory identifies the app)

The \`zapier auth\` and \`zapier create\`/\`zapier link\` commands will help manage those files. All commands listed below.
`.trim());
  return Promise.resolve({})
    .then(() => {
      context.line('');
      var allCommands = Object
        .keys(commands)
        .map((command) => {
          return {
            name: command,
            help: commands[command].help,
            example: commands[command].example
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
  {name: 'cmd'}
];
help.argOptsSpec = {};
help.help = 'Lists all the commands you can use.';
help.example = 'zapier help [command]';
help.docs = `\
Prints documentation to the terminal screen.

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
# The \`zapier auth\` and \`zapier create\`/\`zapier link\` commands will help manage those files. All commands listed below.
# 
# ┌─────────────┬───────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────┐
# │ Command     │ Example                               │ Help                                                                       │
# ├─────────────┼───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
# │ help        │ zapier help [command]                 │ Lists all the commands you can use.                                        │
# │ auth        │ zapier auth                           │ Configure your \`~/.zapierrc\` with a deploy key for using the CLI.          │
# │ create      │ zapier create "Example" [dir]         │ Creates a new app in your account.                                         │
# │ scaffold    │ zapier scaffold model "Contact"       │ Adds a sample model, trigger, action or search to your app.                │
# │ describe    │ zapier describe                       │ Describes the current app.                                                 │
# │ link        │ zapier link                           │ Link the current directory to an app in your account.                      │
# │ apps        │ zapier apps                           │ Lists all the apps you can access.                                         │
# │ versions    │ zapier versions                       │ Lists all the versions of the current app.                                 │
# │ validate    │ zapier validate                       │ Validates the current project.                                             │
# │ build       │ zapier build                          │ Builds a deployable zip from the current directory.                        │
# │ upload      │ zapier upload                         │ Upload the last build as a version.                                        │
# │ push        │ zapier push                           │ Build and upload a new version of the current app - does not deploy.       │
# │ deploy      │ zapier deploy 1.0.0                   │ Deploys a specific version to a production.                                │
# │ migrate     │ zapier migrate 1.0.0 1.0.1 [10%]      │ Migrate users from one version to another.                                 │
# │ deprecate   │ zapier deprecate 1.0.0 2017-01-20     │ Mark a non-production version of your app as deprecated by a certain date. │
# │ collaborate │ zapier collaborate [user@example.com] │ Manage the collaborators on your project. Can optionally --remove.         │
# │ invite      │ zapier invite [user@example.com]      │ Manage the invitees/testers on your project. Can optionally --remove.      │
# │ history     │ zapier history                        │ Prints all recent history for your app.                                    │
# │ logs        │ zapier logs                           │ Prints recent logs. See help for filter arguments.                         │
# │ env         │ zapier env 1.0.0 API_KEY 1234567890   │ Read and write environment variables.                                      │
# └─────────────┴───────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────┘
${'```'}
`;

module.exports = help;
