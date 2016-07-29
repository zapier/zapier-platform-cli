const constants = require('../constants');
const utils = require('../utils');

const linkCmd = () => {
  const appMap = {};

  return utils.listApps()
    .then((data) => {
      console.log('Which app would you like to link the current directory to?\n');
      const apps = data.apps.map((app, index) => {
        app.number = index + 1;
        appMap[app.number] = app;
        return app;
      });
      utils.printData(apps, [
        ['Number', 'number'],
        ['Title', 'title'],
        ['Unique Key', 'key'],
        ['Timestamp', 'date'],
        ['Linked', 'linked'],
      ]);
      console.log('     ...or type any title to create new app!\n');
      return utils.getInput('Which app number do you want to link? You also may type a new app title to create one. (Ctl-C to cancel)\n\n');
    })
    .then((answer) => {
      console.log('');
      if (answer.toLowerCase() === 'no' || answer.toLowerCase() === 'cancel') {
        throw new Error('Cancelled link operation.');
      } else if (appMap[answer]) {
        utils.printStarting(`Selecting existing app "${appMap[answer].title}"`);
        return appMap[answer];
      } else {
        const title = answer;
        utils.printStarting(`Creating a new app named "${title}"`);
        return utils.callAPI('/apps', {
          method: 'POST',
          body: {
            title: title
          }
        });
      }
    })
    .then((app) => {
      utils.printDone();
      utils.printStarting(`Setting up ${constants.CURRENT_APP_FILE} file`);
      return utils.writeLinkedAppConfig(app);
    })
    .then(() => {
      utils.printDone();
      console.log('\nFinished! You can `zapier push` now to build & upload a version!');
    });
};
linkCmd.help = 'Link the current directory to an app in your account.';
linkCmd.example = 'zapier link';
linkCmd.docs = `\
# TODO!

This is markdown documentation.
`;

module.exports = linkCmd;
