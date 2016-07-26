require('babel-polyfill');

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
      console.log('');
    })
    .catch((err) => {
      console.log('\n');
      console.log(err.stack);
      console.log('\nFailed!');
      throw err;
    });
};
