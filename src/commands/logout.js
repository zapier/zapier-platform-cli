const constants = require('../constants');
const utils = require('../utils');

const logout = async context => {
  context.line(
    'Preparing to deactivate local deploy key and reset local configs.'
  );
  context.line();
  utils.startSpinner('Deactivating local deploy key');
  try {
    await utils.callAPI('/keys', {
      method: 'DELETE',
      body: { single: true }
    });
  } catch (e) {
    // no worries
  }

  utils.endSpinner();
  utils.startSpinner(`Destroying \`${constants.AUTH_LOCATION_RAW}\``);
  await utils.deleteFile(constants.AUTH_LOCATION);

  utils.endSpinner();
  context.line();
  context.line('The active deploy key was deactivated');
};
logout.argsSpec = [];
logout.argOptsSpec = {};
logout.help = `Deactivates your acive deploy key and resets \`${
  constants.AUTH_LOCATION_RAW
}\`.`;
logout.example = 'zapier logout';
logout.docs = `
Deactivates your local deploy key and resets your local config. Does not delete any apps, versions, or other keys. To audit all your active deploy keys, go to TODO: FIX.

> This will delete the  \`${
  constants.AUTH_LOCATION_RAW
}\` (home directory identifies the deploy key & user).

${'```'}bash
$ zapier logout
Preparing to deactivate local deploy key and reset local configs.

  Deactivating local deploy key - done!
  Destroying \`~/.zapierrc\` - done!

The active deploy key was deactivated
${'```'}
`;

module.exports = logout;
