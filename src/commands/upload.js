const constants = require('../constants');
const utils = require('../utils');

var upload = () => {
  var zipPath = constants.BUILD_PATH;
  console.log('Preparing to upload a new version.\n');
  return utils.upload(zipPath)
    .then(() => {
      console.log(`\nUpload of ${constants.BUILD_PATH} complete! Try \`zapier versions\` now!`);
    });
};
upload.help = 'Upload the last build as a version.';
upload.example = 'zapier upload';
upload.docs = `\
# TODO!

This is markdown documentation.
`;

module.exports = upload;
