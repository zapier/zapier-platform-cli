const utils = require('../utils');

var pushCmd = () => {
  console.log('Preparing to build and upload a new version.\n');
  return utils.buildAndUploadCurrentDir()
    .then(() => {
      console.log('\nBuild and upload complete! Try loading the Zapier editor now, or try `zapier migrate` to move users over.');
    });
};
pushCmd.help = 'Build and upload a new version of the current app - does not deploy.';
pushCmd.example = 'zapier push';
pushCmd.docs = `\
# TODO!

This is markdown documentation.
`;

module.exports = pushCmd;
