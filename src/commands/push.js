const utils = require('../utils');

var push = () => {
  console.log('Preparing to build and upload a new version.\n');
  return utils.buildAndUploadCurrentDir()
    .then(() => {
      console.log('\nBuild and upload complete! Try loading the Zapier editor now, or try `zapier migrate` to move users over.');
    });
};
push.help = 'Build and upload a new version of the current app - does not deploy.';
push.example = 'zapier push';
push.docs = `\
### TODO!

This is markdown documentation.
`;

module.exports = push;
