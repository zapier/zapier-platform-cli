const constants = require('../constants');
const utils = require('../utils');

const QUESTION = 'What is your Deploy Key from https://zapier.com/platform/? (Ctl-C to cancel)';
const SUCCESS = `Your deploy key has been saved to ${constants.AUTH_LOCATION}.`;
const auth = () => {
  const checks = [
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
      return utils.getInput(QUESTION + '\n\n  ');
    })
    .then((answer) => {
      return utils.writeFile(constants.AUTH_LOCATION, utils.prettyJSONstringify({
        deployKey: answer
      }));
    })
    .then(utils.checkCredentials)
    .then(() => {
      console.log('');
      console.log(SUCCESS + ' Now try `zapier create` or `zapier link`.');
    });
};
auth.help = `Configure your \`${constants.AUTH_LOCATION}\` with a deploy key for using the CLI.`;
auth.example = 'zapier auth';
auth.docs = `\
This is an interactive prompt which will set up your account deploy keys and credentials.

**Options**

${utils.defaultOptionsDocFragment({cmd: 'auth'})}

${'```'}bash
$ zapier auth
# ${QUESTION}
#  <type here>
# ${SUCCESS}
${'```'}
`;

module.exports = auth;
