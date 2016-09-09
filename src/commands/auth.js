const constants = require('../constants');
const utils = require('../utils');

const QUESTION = 'What is your Deploy Key from https://zapier.com/platform/ (or https://beta.zapier.com/admin/developer_v3/deploykey/ during testing)? (Ctl-C to cancel)';
const SUCCESS = `Your deploy key has been saved to ${constants.AUTH_LOCATION}.`;
const auth = (context) => {
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
        context.line(`Your ${constants.AUTH_LOCATION} has not been set up yet.\n`);
      } else if (!credentialsGood) {
        context.line(`Your ${constants.AUTH_LOCATION} looks like it has invalid credentials.\n`);
      } else {
        context.line(`Your ${constants.AUTH_LOCATION} looks valid. You may update it now though.\n`);
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
      context.line();
      context.line(SUCCESS + ' Now try `zapier init .` to start a new local app.');
    });
};
auth.argsSpec = [];
auth.argOptsSpec = {};
auth.help = `Configure your \`${constants.AUTH_LOCATION_RAW}\` with a deploy key.`;
auth.example = 'zapier auth';
auth.docs = `\
This is an interactive prompt which will set up your account deploy keys and credentials.

> This will change the  \`${constants.AUTH_LOCATION_RAW}\` (home directory identifies the deploy key & user).

${'```'}bash
$ zapier auth
# ${QUESTION}
#  <type here>
# Your deploy key has been saved to ${constants.AUTH_LOCATION_RAW}. Now try \`zapier init .\` to start a new local app.
${'```'}
`;

module.exports = auth;
