const constants = require('../constants');
const utils = require('../utils');

const link = () => {
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
      utils.printStarting(`Setting up \`${constants.CURRENT_APP_FILE}\` file`);
      return utils.writeLinkedAppConfig(app);
    })
    .then(() => {
      utils.printDone();
      console.log('\nFinished! You can `zapier push` now to build & upload a version!');
    });
};
link.help = 'Link the current directory to an app in your account.';
link.example = 'zapier link';
link.docs = `\
Link the current directory to an app you have access to. It is fairly uncommon to run this command - more often you'd just \`git clone git@github.com:example-inc/example.git\` which would have a \`${constants.CURRENT_APP_FILE}\` file already included. If not, you'd need to be an admin on the app and use this command to regenerate the \`${constants.CURRENT_APP_FILE}\` file.

Or, if you are making an app from scratch - you'd prefer the \`zapier create "Example"\`.

**Options**

${utils.defaultOptionsDocFragment({cmd: 'link'})}

${'```'}bash
$ zapier link
# Which app would you like to link the current directory to?
# 
# ┌────────┬─────────────┬────────────┬─────────────────────┬────────┐
# │ Number │ Title       │ Unique Key │ Timestamp           │ Linked │
# ├────────┼─────────────┼────────────┼─────────────────────┼────────┤
# │ 1      │ Example     │ Example    │ 2016-01-01T22:19:28 │ ✔      │
# └────────┴─────────────┴────────────┴─────────────────────┴────────┘
#      ...or type any title to create new app!
# 
# Which app number do you want to link? You also may type a new app title to create one. (Ctl-C to cancel)
# 
  1
# 
#   Selecting existing app "Example" - done!
#   Setting up \`${constants.CURRENT_APP_FILE}\` file - done!
# 
# Finished! You can \`zapier push\` now to build & upload a version!
${'```'}
`;

module.exports = link;
