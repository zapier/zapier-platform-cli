const constants = require('../constants');
const utils = require('../utils');
const path = require('path');

const register = (context, title, location = '.') => {
  const appDir = path.resolve(location);

  return utils.checkCredentials()
    .then(() => {
      utils.printDone();
      utils.printStarting(`Registering a new app on Zapier named "${title}"`);
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
      context.line('\nFinished! You can open the Zapier editor now, or edit `index.js` then `zapier push` to build & upload a version of your app!');
    });
};
register.argsSpec = [
  {name: 'title', required: true, example: 'My App Name'},
  {name: 'location', default: '.'},
];
register.argOptsSpec = {
};
register.help = 'Registers a new app in your account.';
register.example = 'zapier register "Example" [directory]';
register.docs = `\
This command registers your app with Zapier. After running this, you can run 'zapier push' to deploy a version of your app that you can use in your Zapier editor.

**Arguments**

${utils.argsFragment(register.argsSpec)}
${utils.argOptsFragment(register.argOptsSpec)}

${'```'}bash
$ zapier register "Example" example-dir
# Let\'s register your app "Example" on Zapier!
#
#   Creating a new app named "Example" on Zapier - done!
#   Setting up .zapierapprc file - done!
#   Applying entry point file - done!
#
# Finished!
${'```'}
`;

module.exports = register;
