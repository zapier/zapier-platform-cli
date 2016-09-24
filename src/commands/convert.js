const utils = require('../utils');
const constants = require('../constants');

const convert = (context, appid, location) => {
  context.line('Welcome to the Zapier Platform! :-D');
  context.line();
  context.line(constants.ART);
  context.line();
  context.line('Let\'s convert your app!');
  context.line();

  const createApp = (tempAppDir) => {
    const url = constants.BASE_ENDPOINT + `/api/developer/v1/apps/${appid}/dump`;
    return utils.callAPI(null, {url}).then(legacyApp => {
      return utils.convertApp(legacyApp, tempAppDir)
        .then(() => utils.copyDir(tempAppDir, location));
    });
  };

  return utils.initApp(context, location, createApp)
    .then(() => {
      context.line('\nFinished! You might need to `npm install` then try `zapier test`!');
    });
};

convert.argsSpec = [
  {name: 'appid', require: true},
  {name: 'location', required: true},
];

convert.help = 'Converts a Zapier Platform V2 app to a V3 app, stubs only.';
convert.example = 'zapier convert appid path';
convert.docs = `\
Creates a new Zapier app from an existing V2 app. The new app contains code stubs only.

After running this, you\'ll have a new app in your directory, with stubs for your trigger and actions.  If you re-run this command on an existing directory it will leave existing files alone and not clobber them.

> Note: this doesn't register or push the app with Zapier - try \`zapier register "Example"\` and \`zapier push\` for that!

`;

module.exports = convert;
