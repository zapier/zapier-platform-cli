const _ = require('lodash');

const utils = require('../utils');
const constants = require('../constants');
const register = require('./register');

const build = require('./build');

const createIfNeeded = (context) => {
  if (!utils.fileExistsSync(constants.CURRENT_APP_FILE)) {
    context.line('Looks like this is your first push. Let\'s register your app on Zapier.');
    return utils.getInput('Enter app title (Ctl-C to cancel):\n\n  ')
      .then(title => register(context, title));
  }
  return Promise.resolve();
};

const push = (context) => {
  context.line('Preparing to build and upload a new version.\n');

  return createIfNeeded(context)
    .then(() => utils.buildAndUploadDir())
    .then(() => {
      context.line('\nBuild and upload complete! Try loading the Zapier editor now, or try `zapier promote` to put it into rotation or `zapier migrate` to move users over.');
    });
};
push.argsSpec = [];
push.argOptsSpec = _.extend({
}, build.argOptsSpec);
push.help = 'Build and upload a new version of the current app - does not deploy.';
push.example = 'zapier push';
push.docs = `\
A shortcut for \`zapier build && zapier upload\` - this is our recommended way to push a new version. This is a common workflow:

1. Make changes in \`index.js\` or other files.
2. Run \`npm test\`.
3. Run \`zapier push\`.
4. QA/experiment in the Zapier.com Zap editor.
5. Go to 1 and repeat.

> Note: this is always a safe operation as live/production apps are protected from pushes. You must use \`zapier promote\` or \`zapier migrate\` to impact live users.

If you have not yet registered your app, this command will prompt you for your app title and register the app.

> Note: You might consider \`zapier watch\` for a faster development cycle!

${'```'}bash
$ zapier push
# Preparing to build and upload a new version.
#
#   Copying project to temp directory - done!
#   Installing project dependencies - done!
#   Applying entry point file - done!
#   Validating project - done!
#   Building app definition.json - done!
#   Zipping project and dependencies - done!
#   Cleaning up temp directory - done!
#   Uploading version 1.0.0 - done!
#
# Build and upload complete! Try loading the Zapier editor now, or try \`zapier promote\` to put it into rotation or \`zapier migrate\` to move users over
${'```'}
`;

module.exports = push;
