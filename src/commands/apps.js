const utils = require('../utils');

var apps = () => {
  return utils.listApps()
    .then((data) => {
      console.log('All apps listed below.\n');
      utils.printData(data.apps, [
        ['Title', 'title'],
        ['Unique Key', 'key'],
        ['Timestamp', 'date'],
        ['Linked', 'linked'],
      ]);
      if (!data.apps.length) {
        console.log('\nTry adding an app with the `zapier create` command.');
      } else {
        console.log('\nTry linking the current directory to a different app with the `zapier link` command.');
      }
    });
};
apps.help = 'Lists all the apps in your account.';
apps.example = 'zapier apps';
apps.docs = `\
**TODO!**

This is markdown documentation.
`;

module.exports = apps;
