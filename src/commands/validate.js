const _ = require('lodash');
const colors = require('colors/safe');

const utils = require('../utils');


const validate = (context) => {
  context.line('\nValidating project locally.');
  return Promise.resolve()
    .then(() => utils.localAppCommand({command: 'validate'}))
    .then((errors) => {
      const newErrors = errors.map((error) => {
        error = _.extend({}, error);
        error.property = error.property.replace('instance.', 'App.');
        error.docLinks = (error.docLinks || []).join('\n');
        return error;
      });
      const ifEmpty = colors.grey('No structural errors found during validation routine.');
      utils.printData(newErrors, [
        ['Property', 'property'],
        ['Message', 'message'],
        ['Links', 'docLinks'],
      ], ifEmpty, true);
      return errors;
    })
    .then((errors) => {
      if (errors.length) {
        context.line('Your app is structurally invalid. Address concerns and run this command again.');
      } else {
        context.line('This project looks good!');
      }
    })
    .then(() => {
      if (global.argOpts['include-style']) {
        utils.localAppCommand({ command: 'definition' })
          .then((rawDefinition) => {
            return utils.callAPI('/style-check', {
              skipDeployKey: true,
              method: 'POST',
              body: rawDefinition
            });
          })
          .then((styleResult) => {
            // process errors
            let res = [];
            context.line('\nChecking app style.');
            const ifEmpty = colors.grey('No style errors found during validation routine.');
            for (const severity in styleResult) {
              for (const type in styleResult[severity]) {
                for (const method in styleResult[severity][type]) {
                  res.push({
                    category: severity,
                    method: `${type}.${method}`,
                    description: styleResult[severity][type][method].join('\n')
                  });
                }
              }
            }

            if (res.length) {
              utils.printData(res, [
                ['Category', 'category'],
                ['Method', 'method'],
                ['Description', 'description'],
              ], ifEmpty, true);
              context.line('Errors will prevent deploys, warnings are things to improve on.\n');
            } else {
              context.line('Your app looks great!\n');
            }
          });
      }
    });
};
validate.argsSpec = [];
validate.argOptsSpec = {
  'include-style': { flag: true, help: 'ping the Zapier server to do a style check' },
};
validate.help = 'Validates the current app.';
validate.example = 'zapier validate';
validate.docs = `\
Runs the standard validation routine powered by json-schema that checks your app for any structural errors. This is the same routine that runs during \`zapier build\`, \`zapier uploard\`, \`zapier push\` or even as a test in \`zapier test\`.

**Arguments**

${utils.argsFragment(validate.argsSpec)}
${utils.argOptsFragment(validate.argOptsSpec)}
${utils.defaultArgOptsFragment()}

${'```'}bash
$ zapier validate
# Validating project locally.
#
# No errors found during validation routine.
#
# This project looks good!

$ zapier validate
# Validating project locally.
#
# ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
# │ = 1 =                                                                                                      │
# │     Property │ instance                                                                                    │
# │     Message  │ requires property "platformVersion"                                                         │
# │     Links    │ https://github.com/zapier/zapier-platform-schema/blob/v1.0.0/docs/build/schema.md#appschema │
# └──────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┘
#
# Make any changes to your project and rerun this command.
${'```'}
`;

module.exports = validate;
