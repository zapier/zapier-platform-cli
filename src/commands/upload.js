const constants = require('../constants');
const utils = require('../utils');

var uploadCmd = () => {
  var zipPath = constants.BUILD_PATH;
  console.log('Preparing to upload a new version.\n');
  return utils.upload(zipPath)
    .then(() => {
      console.log(`\nUpload of ${constants.BUILD_PATH} complete! Try \`zapier versions\` now!`);
    });
};
uploadCmd.help = 'Upload the last build as a version.';
uploadCmd.example = 'zapier upload';

module.exports = uploadCmd;
