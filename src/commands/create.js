const constants = require('../constants');
const utils = require('../utils');

var create = (title, location = '.') => {
  return utils.checkCredentials()
    .then(() => {
      console.log('Welcome to the Zapier Platform! :-D');
      console.log();
      console.log(constants.ART);
      console.log();
      console.log(`Let's create your app "${title}"!`);
      console.log();

      let repo = constants.STARTER_REPO;
      if (global.argOpts.style) {
        repo = `${constants.STARTER_REPO}-${global.argOpts.style}`;
      }

      utils.printStarting('Cloning starter app from ' + repo);
      return utils.runCommand('git', ['clone', `git@github.com:${repo}.git`, location || '.']);
    })
    .then(() => {
      if (location !== '') {
        return utils.runCommand('cd', [location]);
      }
      return Promise.resolve();
    })
    .then(() => {
      return utils.removeDir('.git');
    })
    .then(() => {
      utils.printDone();
      utils.printStarting('Installing project dependencies');
      return utils.runCommand('npm', ['install']);
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
      return utils.writeLinkedAppConfig(app);
    })
    .then(() => {
      utils.printDone();
      return utils.buildAndUploadCurrentDir();
    })
    .then(() => {
      console.log('\nFinished! You can open the Zapier editor now, or edit `index.js` then `zapier push` to build & upload a new version!');
    });
};
create.help = 'Creates a new app in your account.';
create.example = 'zapier create "My Example App"';
create.docs = `\
A handy command that will perform a bunch of steps for you:

* Clone an working example Github repository Zapier app
* Remove the .git config (so you can optionally run \`git init\`)
* npm install all needed dependencies
* Register the app with Zapier
* Push a working version as a private app on Zapier

After running this, you'll have a working app in your Zapier editor. This should be your first stop after installing and running \`zapier auth\`.

${'```'}bash
$ zapier create "My App"
$ zapier create "Hello World" --style=helloworld
$ zapier create "Joe's CRM" --style=oauth2
# Let's create your app "My App"!
#
#   Cloning starter app from zapier/example-app - done!
#   Installing project dependencies - done!
#   Creating a new app named "My App" - done!
#   Setting up .zapierapprc file - done!
#   Copying project to temp directory - done!
#   Installing project dependencies - done!
#   Applying entry point file - done!
#   Validating project - done!
#   Building app definition.json - done!
#   Zipping project and dependencies - done!
#   Cleaning up temp directory - done!
#   Uploading version 1.2.50 - done!
#
# Finished!
${'```'}
`;

module.exports = create;
