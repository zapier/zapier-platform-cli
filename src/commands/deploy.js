const utils = require('../utils');


var deployCmd = (version) => {
  if (!version) {
    console.log('Error: No deploment/version selected...\n');
    return Promise.resolve();
  }

  return utils.checkCredentials()
    .then(utils.getLinkedApp)
    .then((app) => {
      console.log(`Preparing to deploy version ${version} your app "${app.title}".\n`);
      var url = `/apps/${app.id}/versions/${version}/deploy/production`;
      utils.printStarting(`Deploying ${version}`);
      return utils.callAPI(url, {
        method: 'PUT',
        body: {}
      });
    })
    .then(() => {
      utils.printDone();
      console.log(`  Deploy successful!\n`);
      console.log('Optionally try the \`zapier migrate 1.0.0 1.0.1 [10%]\` command to put it into rotation.');
    });
};
deployCmd.help = 'Deploys a specific version to a production.';
deployCmd.example = 'zapier deploy 1.0.0';


module.exports = deployCmd;
