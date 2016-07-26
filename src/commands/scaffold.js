const path = require('path');

const _ = require('lodash');

const utils = require('../utils');


const scaffoldCmd = (type, title) => {
  const context = {
    CAMEL: utils.camelCase(title),
    KEY: utils.snakeCase(title),
    NOUN: title,
    LOWER_NOUN: title.toLowerCase()
  };
  const typeMap = {
    model: 'models',
    trigger: 'triggerss',
    search: 'searches',
    write: 'writes',
  };

  const dest = global.argOpts.dest || `${typeMap[type]}/${context.KEY}`;
  const destFile = path.join(process.cwd(), dest + '.js');
  const entry = global.argOpts.entry || 'index.js';
  const entryFile = path.join(process.cwd(), entry);

  if (typeMap[type]) {
    console.log(`Adding ${type} scaffold to your project.\n`);

    return utils.readFile(`../scaffold/${type}.template.js`)
      .then(templateBuf => templateBuf.toString())
      .then(template => _.template(template, {interpolate: /<%=([\s\S]+?)%>/g})(context))
      .then(rendered => {
        utils.printStarting(`Writing new ${dest}.js`);
        return utils.writeFile(destFile, rendered);
      })
      .then(() => utils.printDone())
      .then(() => utils.readFile(entryFile))
      .then(entryBuf => entryBuf.toString())
      .then(entryJs => {
        utils.printStarting(`Rewriting your ${entry}`);
        let lines = entryJs.split('\n');

        // this is very dumb and will definitely break, it inserts lines of code
        // we should look at jscodeshift or friends to do this instead

        // insert Model = require() line at top
        const importerLine = `const ${context.CAMEL} = require('./${dest}');`;
        lines.splice(0, 0, importerLine);

        // insert '[Model.key]: Model,' after 'models:' line
        const injectorLine = `[${context.CAMEL}.key]: ${context.CAMEL},`;
        const linesDefIndex = _.findIndex(lines, (line) => line.indexOf(`${typeMap[type]}:`) !== -1);
        lines.splice(linesDefIndex + 1, 0, '    ' + injectorLine);

        return utils.writeFile(entryFile, lines.join('\n'));
      })
      .then(() => utils.printDone())
      .then(() => console.log('\nFinished! We did the best we could, you might gut check your files though.'));
  } else {
    return Promise.resolve()
      .then(() => {
        throw new Error(`Scaffold type "${type}" not found!`);
      });
  }
};
scaffoldCmd.help = 'Adds a sample model, trigger, action or search to your app.';
scaffoldCmd.example = 'zapier scaffold model "Contact"';
scaffoldCmd.docs = `\
Usage: zapier scaffold {model|trigger|search|write} [--entry|--dest]

${scaffoldCmd.help}

Does two primary things:

  * Creates a new destination file like "models/contact.js"
  * Imports and registers this inside your entry "index.js"

Examples:

  $ ${scaffoldCmd.example}
  $ zapier scaffold model "Contact" --entry=index.js
  $ zapier scaffold model contact --dest=models/contact
  $ zapier scaffold model contact --entry=index.js --dest=models/contact

`;

module.exports = scaffoldCmd;
