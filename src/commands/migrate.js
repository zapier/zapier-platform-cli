const utils = require('../utils');

var migrate = (oldVersion, newVersion, optionalPercent = '100%') => {
  if (!newVersion) {
    console.log('Must provide both old and new version like `zapier migrate 1.0.0 1.0.1`.');
    return Promise.resolve();
  }
  optionalPercent = parseInt(optionalPercent, 10);
  return utils.getLinkedApp()
    .then(app => {
      console.log(`Getting ready to migrate your app "${app.title}" from ${oldVersion} to ${newVersion}.\n`);
      utils.printStarting(`Starting migration from ${oldVersion} to ${newVersion} for ${optionalPercent}%`);
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
Starts a migration to move users between different versions of your app. You may also "revert" by simply swapping the from/to verion strings in the command line arguments (IE: \`zapier migrate 1.0.1 1.0.0\`).

Migrations can take between 5-10 minutes, so be patient and check \`zapier history\` to track the status.

> Tip! We recommend migrating a small subset of users first, then watching error logs for the new version for any sort of odd behavior. When you feel confident there are no bugs, go ahead and migrate everyone. If you see unexpected errors, you can revert simply.

**Options**

* \`1.0.0\` -- the version **from** which to migrate users
* \`1.0.1\` -- the version **to** which to migrate users
* \`[10%]\` -- an optional percent of users to migrate, default is \`100%\`
${utils.defaultOptionsDocFragment({cmd: 'versions'})}

${'```'}bash
$ zapier migrate 1.0.0 1.0.1 15%
# Getting ready to migrate your app "Example" from 1.0.0 to 1.0.1.
# 
#   Starting migration from 1.0.0 to 1.0.1 for 15% - done!
# 
# Deploy successfully queued, please check \`zapier history\` to track the status. Normal deploys take between 5-10 minutes.
${'```'}
`;

module.exports = migrate;
