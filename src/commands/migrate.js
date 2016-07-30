const utils = require('../utils');

var migrate = (oldVersion, newVersion, optionalPercent = '100%') => {
  if (!newVersion) {
    console.log('Must provide both old and new version like `zapier migrate 1.0.0 1.0.1`.');
    return Promise.resolve();
  }
  optionalPercent = parseInt(optionalPercent, 10);
  return utils.getLinkedApp()
    .then(app => {
      console.log(`Getting ready to migrate your app ${app.title} from ${oldVersion} to ${newVersion}.\n`);
      // r'^apps/(?P<app_id>\d+)/versions/(?P<version_from>\d{1,3}\.\d{1,3}\.\d{1,3})/migrate-to/(?P<version_to>\d{1,3}\.\d{1,3}\.\d{1,3})$',
      utils.printStarting(`Migrating ${oldVersion} to ${newVersion} for ${optionalPercent}%`);
      return utils.callAPI(`/apps/${app.id}/versions/${oldVersion}/migrate-to/${newVersion}`, {
        method: 'POST',
        body: {
          percent: optionalPercent
        }
      });
    })
    .then(() => {
      utils.printDone();
      console.log('\nDeploy successfully queued, please check `zapier history` to track the status. Normal deploys take between 5-10 minutes.');
    });
};
migrate.help = 'Migrate users from one version to another.';
migrate.example = 'zapier migrate 1.0.0 1.0.1 [10%]';
migrate.docs = `\
### TODO!

This is markdown documentation.
`;

module.exports = migrate;
