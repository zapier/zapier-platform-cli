const utils = require('../utils');

const _delete = (context, version) => {
  if (!version) {
    context.line('Error: No version - provide a version like "1.0.0"...\n');
    return Promise.resolve(true);
  }
  return utils.checkCredentials()
    .then(() => utils.getLinkedApp())
    .then((app) => {
      context.line(`Preparing to delete version ${version} of your app "${app.title}".\n`);
      const url = `/apps/${app.id}/versions/${version}`;
      utils.printStarting(`Deleting ${version}`);
      return utils.callAPI(url, {
        method: 'DELETE',
      });
    })
    .then(() => {
      utils.printDone();
      context.line('  Deletion successful!\n');
    });
};
_delete.argsSpec = [
  {name: 'version', example: '1.0.0', required: true, help: 'the version to delete'},
];
_delete.argOptsSpec = {};
_delete.help = 'Delete a version of your app as long as it has no users/Zaps.';
_delete.example = 'zapier delete 1.0.0';
_delete.docs = `\
A utility to allow deleting app versions that aren't used.

> The app version needs to have no users/Zaps in order to be deleted.

**Arguments**

${utils.argsFragment(_delete.argsSpec)}
${utils.argOptsFragment(_delete.argOptsSpec)}

${'```'}bash
$ zapier delete 1.0.0
# Preparing to delete version 1.0.0 of your app "Example".
#
#   Deleting 1.0.0 - done!
#   Deletion successful!
${'```'}
`;

module.exports = _delete;
