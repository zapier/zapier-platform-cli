const constants = require('../constants');
const utils = require('../utils');


var validateCmd = () => {
  console.log('Validating project locally.\n');
  return Promise.resolve()
    .then(() => {
      var appRaw = require(`${process.cwd()}/index`);
      var zapier = require(`${process.cwd()}/node_modules/${constants.PLATFORM_PACKAGE}`);
      var handler = zapier.exposeAppHandler(appRaw);
      var promise = utils.makePromise();
      handler({
        command: 'validate',
        calledFromCli: true,
        doNotMonkeyPatchPromises: true // can drop this
      }, {}, promise.callback);
      return promise;
    })
    .then(response => response.results)
    .then((errors) => {
      const newErrors = errors.map(({property, message, docLinks}) => {
        return {
          property,
          message,
          docLinks: (docLinks || []).join('\n')
        };
      });
      utils.printData(newErrors, [
        ['Property', 'property'],
        ['Message', 'message'],
        ['Links', 'docLinks'],
      ]);
      return errors;
    })
    .then((errors) => {
      if (errors.length) {
        console.log(`\nMake any changes to your project and rerun this command.`);
      } else {
        console.log(`\nThis project looks good!`);
      }
    });
};
validateCmd.help = 'Validates the current project.';
validateCmd.example = 'zapier validate';


module.exports = validateCmd;
