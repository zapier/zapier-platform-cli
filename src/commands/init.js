const path = require('path');
const tmp = require('tmp');

const utils = require('../utils');
const exampleApps = require('../utils/example-apps');
const constants = require('../constants');
const appTemplates = require('../app-templates');

const confirmNonEmptyDir = (location) => {
  if (location === '.') {
    return utils.isEmptyDir(location)
      .then(isEmpty => {
        if (!isEmpty) {
          return utils.getInput('Current directory not empty, continue anyway? (y/n) ')
            .then(answer => {
              if (!answer.match(/^y/i)) {
                /*eslint no-process-exit: 0 */
                process.exit(0);
              }
            });
        }
        return Promise.resolve();
      });
  }
  return Promise.resolve();
};

const initApp = (context, location) => {
  const appDir = path.resolve(location);
  const tempAppDir = tmp.tmpNameSync();

  const copyOpts = {
    clobber: false,
    onCopy: file => {
      utils.printStarting(`Copy ${file}`);
      utils.printDone();
    },
    onSkip: file => {
      utils.printStarting(`File ${file} already exists`);
      utils.printDone(true, 'skipped');
    }
  };

  const template = global.argOpts.template || 'minimal';

  return confirmNonEmptyDir(location).
    then(() => {
      utils.printStarting(`Downloading zapier/zapier-platform-example-app-${template} starter app`);
    })
    .then(() => utils.removeDir(tempAppDir))
    .then(() => utils.ensureDir(tempAppDir))
    .then(() => exampleApps.downloadAndUnzipTo(template, tempAppDir))
    .then(() => utils.printDone())
    .then(() => utils.ensureDir(appDir))
    .then(() => context.line())
    .then(() => utils.copyDir(tempAppDir, appDir, copyOpts))
    .then(() => utils.removeDir(tempAppDir))
    .then(() => utils.printStarting('Copying starter app'))
    .then(() => utils.printDone());
};

const init = (context, location = '.') => {
  context.line('Welcome to the Zapier Platform! :-D');
  context.line();
  context.line(constants.ART);
  context.line();
  context.line('Let\'s initialize your app!');
  context.line();

  return initApp(context, location)
    .then(() => {
      context.line('\nFinished! You can edit `index.js` and then `zapier deploy` to build & upload your app!');
    });
};

init.argsSpec = [
  {name: 'location', default: '.'},
];
init.argOptsSpec = {
  template: {help: 'select a starting app template', choices: appTemplates, 'default': 'minimal'}
};
init.help = 'Initializes a new zapier app in a directory.';
init.example = 'zapier init [location]';
init.docs = `\
Initializes a new zapier app. If you specify a template, will download and install app from that template.

After running this, you\'ll have a new example app in your directory. If you re-run this command on an existing directory it will leave existing files alone and not clobber them.

> Note: this doesn't register the app with Zapier - try \`zapier register "Example"\` and \`zapier deploy\` for that!

**Arguments**

${utils.argsFragment(init.argsSpec)}
${utils.argOptsFragment(init.argOptsSpec)}

${'```'}bash
$ zapier init example-dir --template=helloworld
# Let\'s create your app!
#
#   Cloning starter app from zapier/example-app - done!
#
# Finished!
${'```'}
`;

module.exports = init;
