#!/usr/bin/env node

var constants = require('./src/constants');
var commands = require('./src/commands');

var main = (argv) => {
  if (constants.DEBUG) {
    console.log('running in:', process.cwd());
    console.log('raw argv:', argv);
    console.log('\n--------------------------------------------------\n\n');
  }

  argv = argv.slice(2);
  var command = argv[0];
  var args = argv.slice(1);

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

main(process.argv);
