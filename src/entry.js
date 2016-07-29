require('babel-polyfill');

const colors = require('colors/safe');

const constants = require('./constants');
const commands = require('./commands');
const utils = require('./utils');

module.exports = (argv) => {
  if (constants.DEBUG) {
    console.log('running in:', process.cwd());
    console.log('raw argv:', argv);
    console.log('\n--------------------------------------------------\n\n');
  }

  argv = argv.slice(2); // strip path, zapier.js

  let [args, argOpts] = utils.argParse(argv);
  global.argOpts = argOpts;

  const command = args[0];
  args = args.slice(1);

  let commandFunc = commands[command];
  if (!commandFunc) {
    commandFunc = commands.help;
  }

  commandFunc.apply(commands, args)
    .then(() => {
      utils.clearSpinner();
      console.log('');
    })
    .catch((err) => {
      utils.clearSpinner();
      if (constants.DEBUG || global.argOpts.debug) {
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
