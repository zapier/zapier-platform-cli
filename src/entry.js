require('babel-polyfill');

const colors = require('colors/safe');

const {DEBUG, MIN_NODE_VERSION} = require('./constants');
const commands = require('./commands');
const utils = require('./utils');

module.exports = (argv) => {
  if (!utils.isValidNodeVersion()) {
    console.error(
      `Requires node version >= ${MIN_NODE_VERSION.major}.${MIN_NODE_VERSION.minor}.${MIN_NODE_VERSION.patch}, found ${process.versions.node}. Please upgrade node.`
    );
    /*eslint no-process-exit: 0 */
    process.exit(1);
  }

  if (DEBUG) {
    console.log('running in:', process.cwd());
    console.log('raw argv:', argv);
    console.log('\n--------------------------------------------------\n\n');
  }

  argv = argv.slice(2); // strip path, zapier.js

  let [args, argOpts] = utils.argParse(argv);
  global.argOpts = argOpts;

  // when `zapier invitees --help`, swap to `zapier help invitees`
  if (argOpts.help || args.length === 0) {
    args = ['help'].concat(args);
  }

  const command = args[0];
  args = args.slice(1);

  let commandFunc = commands[command];
  if (!commandFunc) {
    commandFunc = commands.help;
    console.log(`${command} not a command! Try running \`zapier help\`?`);
    return;
  }

  commandFunc.apply(commands, args)
    .then(() => {
      utils.clearSpinner();
      console.log('');
    })
    .catch((err) => {
      utils.clearSpinner();
      if (DEBUG || global.argOpts.debug) {
        console.log('');
        console.log(err.stack);
        console.log('');
        console.log(colors.red('Error!'));
      } else {
        console.log('');
        console.log('');
        console.log(colors.red('Error!') + ' ' + colors.red(err.message));
        colors.grey('(Use --debug flag and run this command again to get more details.)');
      }
      throw err;
    });
};
