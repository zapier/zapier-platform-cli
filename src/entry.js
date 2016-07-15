require('babel-polyfill');

var constants = require('./constants');
var commands = require('./commands');
var utils = require('./utils');

module.exports = (argv) => {
  if (constants.DEBUG) {
    console.log('running in:', process.cwd());
    console.log('raw argv:', argv);
    console.log('\n--------------------------------------------------\n\n');
  }

  argv = argv.slice(2); // strip path, zapier.js

  var [args, argOpts] = utils.argParse(argv);
  global.argOpts = argOpts;

  var command = args[0];
  args = args.slice(1);

  var commandFunc = commands[command];
  if (!commandFunc) {
    console.log('Usage: zapier COMMAND [command-specific-options]\n');
    commandFunc = commands.help;
  }

  commandFunc.apply(commands, args)
    .then(() => {
      console.log('');
    })
    .catch((err) => {
      console.log('\n');
      console.log(err.stack);
      console.log('\nFailed!');
      throw err;
    });
};
