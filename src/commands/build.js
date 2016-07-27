const constants = require('../constants');
const utils = require('../utils');


var buildCmd = () => {
  console.log('Building project.\n');
  return utils.build()
    .then(() => {
      console.log(`\nBuild complete in ${constants.BUILD_PATH}! Try the \`zapier upload\` command now.`);
    });
};
buildCmd.help = 'Builds a deployable zip from the current directory.';
buildCmd.example = 'zapier build';


module.exports = buildCmd;
