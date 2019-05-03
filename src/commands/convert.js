const utils = require('../utils');
const constants = require('../constants');

const convert = (context, appid, location) => {
  context.line('Welcome to the Zapier Platform!');
  context.line();
  context.line(constants.ART);
  context.line();
  context.line("Let's convert your app!");
  context.line();

  appid = Number(appid);
  if (!appid) {
    const message = `You must provide an appid - get that from ${
      constants.BASE_ENDPOINT
    }/developer/builder/ (check the URL).`;
    return Promise.reject(new Error(message));
  }

  const createApp = async tempAppDir => {
    if (context.argOpts.version) {
      // has info about the app, such as title
      const appInfoUrl = `${
        constants.BASE_ENDPOINT
      }/api/platform/cli/apps/${appid}`;
      // has a CLI version of the actual app implementation
      const versionInfoUrl = `${
        constants.BASE_ENDPOINT
      }/api/platform/cli/apps/${appid}/versions/${context.argOpts.version}`;

      utils.startSpinner('Downloading app from Zapier');
      let [appInfo, versionInfo] = [];
      try {
        [appInfo, versionInfo] = await Promise.all([
          utils.callAPI(null, { url: appInfoUrl }, true),
          utils.callAPI(null, { url: versionInfoUrl }, true)
        ]);
      } catch (e) {
        if (e.status === 404) {
          throw new Error(
            `Visual Builder app ${appid} @ ${
              context.argOpts.version
            } not found. If you want to convert a Legacy Web Builder app, don't pass a \`--version\` option.`
          );
        }
      }
      utils.endSpinner();
      return utils.convertVisualApp(appInfo, versionInfo, tempAppDir);
    } else {
      // has info about the app, such as title
      const legacyDumpUrl = `${
        constants.BASE_ENDPOINT
      }/api/developer/v1/apps/${appid}/dump`;
      // has a CLI version of the actual app implementation
      const cliDumpUrl = `${
        constants.BASE_ENDPOINT
      }/api/developer/v1/apps/${appid}/cli-dump`;

      utils.startSpinner('Downloading app from Zapier');
      let [legacyApp, appDefinition] = [];
      try {
        [legacyApp, appDefinition] = await Promise.all([
          utils.callAPI(null, { url: legacyDumpUrl }, true),
          utils.callAPI(null, { url: cliDumpUrl }, true)
        ]);
      } catch (e) {
        if (e.status === 404) {
          throw new Error(
            `Legacy Web Builder app ${appid} not found. If you want to convert a Visual Builder app, make sure to pass a \`--version\` option.`
          );
        }
      }

      // The JSON dump of the app doesn't have app ID, let's add it here
      legacyApp.general.app_id = appid;

      utils.endSpinner();

      return utils.convertLegacyApp(legacyApp, appDefinition, tempAppDir);
    }
  };

  return utils.initApp(context, location, createApp).then(() => {
    context.line();
    context.line(
      `Finished! You may try \`npm install\` and then \`zapier test\` in "${location}" directory.`
    );
    context.line(
      "Also, if your app has authentication, don't forget to set environment variables:"
    );
    context.line('* for local testing, edit the .env file');
    context.line('* for produciton, use `zapier env` command');
  });
};
convert.argsSpec = [
  {
    name: 'appid',
    required: true,
    help: `Get the appid from ${
      constants.BASE_ENDPOINT
    }/developer/builder/ (check the URL)`
  },
  {
    name: 'location',
    required: true,
    help: 'Relative to your current path - IE: `.` for current directory'
  }
];
convert.argOptsSpec = {
  version: {
    help:
      'Convert a specific version. Required when converting a Visual Builder app',
    example: '1.0.0'
  }
};
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
$ zapier convert 1234 .
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
