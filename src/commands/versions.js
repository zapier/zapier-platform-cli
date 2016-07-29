const utils = require('../utils');

var versionsCmd = () => {
  return utils.listVersions()
    .then((data) => {
      console.log(`All versions of your app "${data.app.title}" listed below.\n`);
      utils.printData(data.versions, [
        ['Version', 'version'],
        ['Platform', 'platform_version'],
        ['Users', 'user_count'],
        ['Deployment', 'deployment'],
        ['Deprecation Date', 'deprecation_date'],
        ['Timestamp', 'date'],
      ]);
      if (!data.versions.length) {
        console.log('\nTry adding an version with the `zapier push` command.');
      }
    });
};
versionsCmd.help = 'Lists all the versions of the current app.';
versionsCmd.example = 'zapier versions';
versionsCmd.docs = `\
# TODO!

This is markdown documentation.
`;

module.exports = versionsCmd;
