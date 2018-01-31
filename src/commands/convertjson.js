const fs = require('fs');
const utils = require('../utils');
const constants = require('../constants');

const convert = (context, filename, location) => {
  context.line('Welcome to the Zapier Platform! :-D');
  context.line();
  context.line(constants.ART);
  context.line();
  context.line("Let's convert your app!");
  context.line();

  utils.printStarting('Loading app definition from file');

  const legacyApp = JSON.parse(fs.readFileSync(filename, 'utf-8'));
  const createApp = tempAppDir => {
    return utils.convertApp(legacyApp, tempAppDir);
  };

  return utils.initApp(context, location, createApp).then(() => {
    context.line(
      '\nFinished! You might need to `npm install` then try `zapier test`!'
    );
  });
};
convert.argsSpec = [
  {
    name: 'filename',
    required: true,
    help: 'JSON file that contains the legacy app definition.'
  },
  {
    name: 'location',
    required: true,
    help: 'Relative to your current path - IE: `.` for current directory'
  }
];
convert.help = 'Converts a Zapier Platform app to a CLI app, stubs only.';
convert.example = 'zapier convert appid path';
convert.docs = `
Creates a new Zapier app from an existing app. **The new app contains code stubs only.** It is supposed to get you started - it isn't going to create a complete app!

After running this, you'll have a new app in your directory, with stubs for your trigger and actions.  If you re-run this command on an existing directory it will leave existing files alone and not clobber them.

> Note: this doesn't register or push the app with Zapier - try \`zapier register "Example"\` and \`zapier push\` for that!

**Arguments**

${utils.argsFragment(convert.argsSpec)}
${utils.argOptsFragment(convert.argOptsSpec)}

${'```'}bash
$ zapier convert example.json .
# Let's convert your app!
#
#   Downloading app from Zapier - done!
#   Writing triggers/trigger.js - done!
#   Writing package.json - done!
#   Writing index.js - done!
#   Copy ./index.js - done!
#   Copy ./package.json - done!
#   Copy ./triggers/trigger.js - done!
#
# Finished! You might need to \`npm install\` then try \`zapier test\`!
${'```'}
`;

module.exports = convert;
