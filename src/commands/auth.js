const constants = require('../constants');
const utils = require('../utils');

var authCmd = () => {
  var checks = [
    utils.readCredentials()
      .then(() => true)
      .catch(() => false),
    utils.checkCredentials()
      .then(() => true)
      .catch(() => false)
  ];
  return Promise.all(checks)
    .then(([credentialsPresent, credentialsGood]) => {
      if (!credentialsPresent) {
        console.log(`Your ${constants.AUTH_LOCATION} has not been set up yet.\n`);
      } else if (!credentialsGood) {
        console.log(`Your ${constants.AUTH_LOCATION} looks like it has invalid credentials.\n`);
      } else {
        console.log(`Your ${constants.AUTH_LOCATION} looks valid. You may update it now though.\n`);
      }
      return utils.getInput('What is your Deploy Key from https://zapier.com/platform/? (Ctl-C to cancel)\n\n');
    })
    .then((answer) => {
      return utils.writeFile(constants.AUTH_LOCATION, utils.prettyJSONstringify({
        deployKey: answer
      }));
    })
    .then(utils.checkCredentials)
    .then(() => {
      console.log('');
      console.log(`Your deploy key has been saved to ${constants.AUTH_LOCATION}. Now try \`zapier create\` or \`zapier link\`.`);
    });
};
authCmd.help = `Configure your ${constants.AUTH_LOCATION} with a deploy key for using the CLI.`;
authCmd.example = 'zapier auth';
authCmd.docs = `\
# TODO!

This is markdown documentation.
`;

module.exports = authCmd;
