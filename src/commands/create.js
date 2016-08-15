const constants = require('../constants');
const utils = require('../utils');
const path = require('path');
const os = require('os');

const create = (context, title, location = '.') => {
  const appDir = path.resolve(location);
  const tempAppDir = path.resolve(os.tmpdir(), location);
  const defaultAppDir = path.resolve(__dirname, '../../templates/default-app');

  const repo = global.argOpts.template ?
        `${constants.STARTER_REPO}-${global.argOpts.template}` :
         null;

  return utils.checkCredentials()
    .then(() => {
      context.line('Welcome to the Zapier Platform! :-D');
      context.line();
      context.line(constants.ART);
      context.line();
      context.line(`Let\'s create your app "${title}"!`);
      context.line();
    })
    .then(() => {
      // TODO: this should be smarter - we should allow starting after `npm init`/`git init`, or various
      // other common starting patterns for devs with prebaked assumptions on how to start a project

      if (repo) {
        utils.printStarting('Cloning starter app from ' + repo);

        // could use a library to generate temp dir with unique name instead (there are several out there)
        return utils.removeDir(tempAppDir)
          .then(() => utils.ensureDir(tempAppDir))
          .then(() => utils.runCommand('git', ['clone', `git@github.com:${repo}.git`, tempAppDir]))
          .then(() => utils.removeDir(path.resolve(tempAppDir, '.git')))
          .then(() => utils.ensureDir(appDir))
          .then(() => utils.copyDir(tempAppDir, appDir))
          .then(() => utils.removeDir(tempAppDir));
      } else {
        utils.printStarting('Copying starter app');
        return utils.ensureDir(appDir)
          .then(() => utils.copyDir(defaultAppDir, appDir));
      }
    })
    .then(() => {
      utils.printDone();
      utils.printStarting('Installing project dependencies');
      return utils.npmInstall(appDir);
    })
    .then(() => {
      utils.printDone();
      utils.printStarting(`Creating a new app named "${title}"`);
      return utils.callAPI('/apps', {
        method: 'POST',
        body: {
          title: title
        }
      });
    })
    .then((app) => {
      utils.printDone();
      utils.printStarting(`Setting up ${constants.CURRENT_APP_FILE} file`);
      return utils.writeLinkedAppConfig(app, appDir);
    })
    .then(() => {
      utils.printDone();
      return utils.buildAndUploadCurrentDir(constants.BUILD_PATH, appDir);
    })
    .then(() => {
      context.line('\nFinished! You can open the Zapier editor now, or edit `index.js` then `zapier push` to build & upload a new version!');
    });
};
create.argsSpec = [
  {name: 'title', required: true, example: 'My App Name'},
  {name: 'directory', default: '.'},
];
create.argOptsSpec = {
  template: {help: 'select a starting app template', choices: ['helloworld']}
};
create.help = 'Creates a new app in your account.';
create.example = 'zapier create "Example" [directory]';
create.docs = `\
A handy command that will perform a bunch of steps for you:

* Clone an working example Github repository Zapier app
* Remove the .git config (so you can optionally run \`git init\`)
* npm install all needed dependencies
* Register the app with Zapier
* Push a working version as a private app on Zapier

After running this, you'll have a working app in your Zapier editor. This should be your first stop after installing and running \`zapier auth\`. If the directory is not empty the command will fail.

**Arguments**

${utils.argsFragment(create.argsSpec)}
${utils.argOptsFragment(create.argOptsSpec)}

${'```'}bash
$ zapier create "Example" example-dir --template=helloworld
# Let's create your app "Example"!
#
#   Cloning starter app from zapier/example-app - done!
#   Installing project dependencies - done!
#   Creating a new app named "Example" - done!
#   Setting up .zapierapprc file - done!
#   Copying project to temp directory - done!
#   Installing project dependencies - done!
#   Applying entry point file - done!
#   Validating project - done!
#   Building app definition.json - done!
#   Zipping project and dependencies - done!
#   Cleaning up temp directory - done!
#   Uploading version 1.0.0 - done!
#
# Finished!
${'```'}
`;

module.exports = create;
