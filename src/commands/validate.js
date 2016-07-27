const utils = require('../utils');

const validateCmd = () => {
  console.log('Validating project locally.\n');
  return Promise.resolve()
    .then(() => utils.localAppCommand({command: 'validate'}))
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
