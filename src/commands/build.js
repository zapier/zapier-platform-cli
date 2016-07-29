const constants = require('../constants');
const utils = require('../utils');

var build = () => {
  console.log('Building project.\n');
  return utils.build()
    .then(() => {
      console.log(`\nBuild complete in ${constants.BUILD_PATH}! Try the \`zapier upload\` command now.`);
    });
};
build.help = 'Builds a deployable zip from the current directory.';
build.example = 'zapier build';
build.docs = `\
# TODO!

This is markdown documentation.
`;

module.exports = build;
