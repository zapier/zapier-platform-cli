const utils = require('../utils');

var deploy = (context, version) => {
  if (!version) {
    context.line('Error: No deploment/version selected...\n');
    return Promise.resolve();
  }

  return utils.checkCredentials()
    .then(() => utils.getLinkedApp())
    .then((app) => {
      context.line(`Preparing to deploy version ${version} your app "${app.title}".\n`);
      var url = `/apps/${app.id}/versions/${version}/deploy/production`;
      utils.printStarting(`Deploying ${version}`);
      return utils.callAPI(url, {
        method: 'PUT',
        body: {}
      });
    })
    .then(() => {
      utils.printDone();
      context.line(`  Deploy successful!\n`);
      context.line('Optionally try the \`zapier migrate 1.0.0 1.0.1 [10%]\` command to put it into rotation.');
    });
};
deploy.argsSpec = [
  {name: 'version', example: '1.0.0', required: true},
];
deploy.argOptsSpec = {};
deploy.help = 'Deploys a specific version to a production.';
deploy.example = 'zapier deploy 1.0.0';
deploy.docs = `\
Deploys an app into production (non-private) rotation, which means new users can use this.

* This **does not** build/upload or push a version to Zapier - you should \`zapier push\` first.
* This **does not** move old users over to this version - \`zapier migrate 1.0.0 1.0.1\` does that.

Deploys are an inherently safe operation for all existing users of your app.

> If this is your first time deploying - this will start the platform quality assurance process by alerting the Zapier platform team of your intent to go global. We'll respond within a few business days.

**Arguments**

${utils.argsFragment(deploy.argsSpec)}
${utils.argOptsFragment(deploy.argOptsSpec)}

${'```'}bash
$ zapier deploy 1.0.0
# Preparing to deploy version 1.0.0 your app "Example".
# 
#   Deploying 1.0.0 - done!
#   Deploy successful!
# 
# Optionally try the \`zapier migrate 1.0.0 1.0.1 [10%]\` command to put it into rotation.
${'```'}
`;

module.exports = deploy;
