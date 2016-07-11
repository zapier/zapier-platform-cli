#!/usr/bin/env node

var constants = require('./src/constants');
var commands = require('./src/commands');
var utils = require('./src/utils');

var main = (argv) => {
  if (constants.DEBUG) {
    console.log('running in:', process.cwd());
    console.log('raw argv:', argv);
    console.log('\n--------------------------------------------------\n\n');
  }

  argv = argv.slice(2); // strip path, zapier.js

  var _r = utils.argParse(argv);
  var args = _r[0], opts = _r[1];

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

main(process.argv);
