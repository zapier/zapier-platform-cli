const utils = require('../utils');


var collaboratorsCmd = (collaboratorEmail) => {
  if (collaboratorEmail !== undefined) {
    return utils.checkCredentials()
      .then(utils.getLinkedApp)
      .then((app) => {
        var url = '/apps/' + app.id + '/collaborators/' + collaboratorEmail;
        if (global.argOpts.delete) {
          console.log(`Preparing to remove collaborator ${collaboratorEmail} to your app "${app.title}".\n`);
          utils.printStarting(`Removing ${collaboratorEmail}`);
          return utils.callAPI(url, {method: 'DELETE'});
        } else {
          console.log(`Preparing to add collaborator ${collaboratorEmail} to your app "${app.title}".\n`);
          utils.printStarting(`Adding ${collaboratorEmail}`);
          return utils.callAPI(url, {method: 'POST'});
        }
      })
      .then(() => {
        utils.printDone();
        console.log('');
        console.log('Collaborators updated! Try viewing them with `zapier collaborators`.');
        return;
      });
  }
  return utils.listCollaborators()
    .then((data) => {
      console.log(`The collaborators on your app "${data.app.title}" listed below.\n`);
      utils.printData(data.collaborators, [
        ['Email', 'email'],
        ['Role', 'role'],
      ]);
    });
};
collaboratorsCmd.help = 'Manage the collaborators on your project. Can optionally --delete.';
collaboratorsCmd.example = 'zapier collaborators [john@example.com]';

module.exports = collaboratorsCmd;
