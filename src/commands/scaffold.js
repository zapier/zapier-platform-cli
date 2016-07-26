const path = require('path');

const _ = require('lodash');

const utils = require('../utils');


const scaffoldCmd = (type, name) => {
  if (!name) {
    console.log('Missing arguments. Please see `zaper help scaffold`.');
    return Promise.resolve();
  }

  const context = {
    CAMEL: utils.camelCase(name),
    KEY: utils.snakeCase(name),
    NOUN: name,
    LOWER_NOUN: name.toLowerCase()
  };

  // what is the `models: {}` app definition point?
  const typeMap = {
    model: 'models',
    trigger: 'triggers',
    search: 'searches',
    write: 'writes',
  };

  // where will we write/required the new file?
  const destMap = {
    model: `models/${context.KEY}`,
    trigger: `triggers/${context.KEY}`,
    search: `searches/${context.KEY}`,
    write: `writes/${context.KEY}`,
  };

  if (!typeMap[type]) {
    console.log(`Scaffold type "${type}" not found! Please see \`zaper help scaffold\`.`);
    return Promise.resolve();
  }

  const templateFile = `../scaffold/${type}.template.js`;
  const dest = global.argOpts.dest || destMap[type];
  const destFile = path.join(process.cwd(), dest + '.js');
  const entry = global.argOpts.entry || 'index.js';
  const entryFile = path.join(process.cwd(), entry);

  console.log(`Adding ${type} scaffold to your project.\n`);

  return utils.readFile(templateFile)
    .then(templateBuf => templateBuf.toString())
    .then(template => _.template(template, {interpolate: /<%=([\s\S]+?)%>/g})(context))
    .then(rendered => {
      utils.printStarting(`Writing new ${dest}.js`);
      return utils.ensureDir(path.dirname(destFile))
        .then(() => utils.writeFile(destFile, rendered));
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
      const injectAfter = `${typeMap[type]}: {`;
      const injectorLine = `[${context.CAMEL}.key]: ${context.CAMEL},`;
      const linesDefIndex = _.findIndex(lines, (line) => _.endsWith(line, injectAfter));
      if (linesDefIndex === -1) {
        utils.printDone(false);
        console.log(`\nOops, we could not reliably rewrite your ${entry}. Please add:`);
        console.log(` * \`${importerLine}\` to the top`);
        console.log(` * \`${injectAfter} ${injectorLine} },\` in your app definition`);
        return Promise.resolve();
      } else {
        lines.splice(linesDefIndex + 1, 0, '    ' + injectorLine);
        return utils.writeFile(entryFile, lines.join('\n'))
          .then(() => utils.printDone());
      }
    })
    .then(() => console.log('\nFinished! We did the best we could, you might gut check your files though.'));
};
scaffoldCmd.help = 'Adds a sample model, trigger, action or search to your app.';
scaffoldCmd.example = 'zapier scaffold model "Contact"';
scaffoldCmd.docs = `\
Usage: zapier scaffold {model|trigger|search|write} [--entry|--dest]

${scaffoldCmd.help}

Does two primary things:

  * Creates a new destination file like "models/contact.js"
  * (Attempts to) import and register it inside your entry "index.js"

Examples:

  $ ${scaffoldCmd.example}
  $ zapier scaffold model "Contact" --entry=index.js
  $ zapier scaffold model contact --dest=models/contact
  $ zapier scaffold model contact --entry=index.js --dest=models/contact
`;

module.exports = scaffoldCmd;
