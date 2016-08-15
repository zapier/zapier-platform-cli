const utils = require('../utils');
const constants = require('../constants');
const path = require('path');
const os = require('os');

const initApp = (location) => {
  const appDir = path.resolve(location);
  const tempAppDir = path.resolve(os.tmpdir(), location);
  const vendorAppDir = path.resolve(__dirname, '../../templates/default-app');

  const repo = global.argOpts.template ?
        `${constants.STARTER_REPO}-${global.argOpts.template}` :
         null;
  const copyOpts = {clobber: false};

  if (repo) {
    utils.printStarting('Cloning starter app from ' + repo);
    return utils.removeDir(tempAppDir)
      .then(() => utils.ensureDir(tempAppDir))
      .then(() => utils.runCommand('git', ['clone', `git@github.com:${repo}.git`, tempAppDir]))
      .then(() => utils.removeDir(path.resolve(tempAppDir, '.git')))
      .then(() => utils.ensureDir(appDir))
      .then(() => utils.copyDir(tempAppDir, appDir, copyOpts))
      .then(() => utils.removeDir(tempAppDir));
  } else {
    utils.printStarting('Copying starter app');
    return utils.ensureDir(appDir)
      .then(() => utils.copyDir(vendorAppDir, appDir, copyOpts));
  }
};

const init = (context, location = '.') => {
  context.line('Welcome to the Zapier Platform! :-D');
  context.line();
  context.line(constants.ART);
  context.line();
  context.line('Let\'s initialize your app!');
  context.line();

  return initApp(location)
    .then(() => {
      context.line('\nFinished! You can edit `index.js` and then `zapier push` to build & upload your app!');
    });
};

init.argsSpec = [
  {name: 'location', default: '.'},
];
init.argOptsSpec = {
  template: {help: 'select a starting app template', choices: ['helloworld']}
};
init.help = 'Initializes a new zapier app in a directory.';
init.example = 'zapier init [location]';
init.docs = `\
Initializes a new zapier app. Clones a working example Github repository Zapier app.

After running this, you\'ll have a new example app in your directory. If you re-run this command
on an existing directory it will leave existing files alone and not clobber them.

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
