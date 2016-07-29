const utils = require('../utils');
const colors = require('colors/safe');

const validate = () => {
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
      const ifEmpty = colors.grey('No errors found during validation routine.');
      utils.printData(newErrors, [
        ['Property', 'property'],
        ['Message', 'message'],
        ['Links', 'docLinks'],
      ], ifEmpty);
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
validate.help = 'Validates the current project.';
validate.example = 'zapier validate';
validate.docs = `\
# TODO!

This is markdown documentation.
`;

module.exports = validate;
