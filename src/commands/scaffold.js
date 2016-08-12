const path = require('path');
const _ = require('lodash');

const utils = require('../utils');

const scaffold = (context, type, name) => {
  if (!name) {
    context.line('Missing arguments. Please see `zaper help scaffold`.');
    return Promise.resolve();
  }

  const templateContext = {
    CAMEL: utils.camelCase(name),
    KEY: utils.snakeCase(name),
    NOUN: _.capitalize(name),
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
    model: `models/${templateContext.KEY}`,
    trigger: `triggers/${templateContext.KEY}`,
    search: `searches/${templateContext.KEY}`,
    write: `writes/${templateContext.KEY}`,
  };

  if (!typeMap[type]) {
    context.line(`Scaffold type "${type}" not found! Please see \`zaper help scaffold\`.`);
    return Promise.resolve();
  }

  const templateFile = path.join(__dirname, `../../scaffold/${type}.template.js`);
  const dest = global.argOpts.dest || destMap[type];
  const destFile = path.join(process.cwd(), dest + '.js');
  const entry = global.argOpts.entry || 'index.js';
  const entryFile = path.join(process.cwd(), entry);

  context.line(`Adding ${type} scaffold to your project.\n`);

  return utils.readFile(templateFile)
    .then(templateBuf => templateBuf.toString())
    .then(template => _.template(template, {interpolate: /<%=([\s\S]+?)%>/g})(templateContext))
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
      const importerLine = `const ${templateContext.CAMEL} = require('./${dest}');`;
      lines.splice(0, 0, importerLine);

      // insert '[Model.key]: Model,' after 'models:' line
      const injectAfter = `${typeMap[type]}: {`;
      const injectorLine = `[${templateContext.CAMEL}.key]: ${templateContext.CAMEL},`;
      const linesDefIndex = _.findIndex(lines, (line) => _.endsWith(line, injectAfter));
      if (linesDefIndex === -1) {
        utils.printDone(false);
        context.line(`\nOops, we could not reliably rewrite your ${entry}. Please add:`);
        context.line(` * \`${importerLine}\` to the top`);
        context.line(` * \`${injectAfter} ${injectorLine} },\` in your app definition`);
        return Promise.resolve();
      } else {
        lines.splice(linesDefIndex + 1, 0, '    ' + injectorLine);
        return utils.writeFile(entryFile, lines.join('\n'))
          .then(() => utils.printDone());
      }
    })
    .then(() => context.line('\nFinished! We did the best we could, you might gut check your files though.'));
};
scaffold.help = 'Adds a sample model, trigger, action or search to your app.';
scaffold.usage = 'zapier scaffold {model|trigger|search|write} "Name"';
scaffold.example = 'zapier scaffold model "Contact"';
scaffold.docs = `\
The scaffold command does two general things:

* Creates a new destination file like \`models/contact.js\`
* (Attempts to) import and register it inside your entry \`index.js\`

You can mix and match several options to customize the created scaffold for your project.

> Note, we may fail to rewrite your \`index.js\` so you may need to handle the require and registration yourself.

**Options**

* \`{model|trigger|search|write}\` - what thing are you creating
* \`"Name"\` -- the name of the new thing to create
* \`--dest=path\` -- sets the new file's path, default is \`'{type}s/{name}'\`
* \`--entry=path\` -- where to import the new file, default is \`'index.js'\`

${'```'}bash
$ ${scaffold.example}
$ zapier scaffold model "Contact" --entry=index.js
$ zapier scaffold model "Contag Tag" --dest=models/tag
$ zapier scaffold model "Tag" --entry=index.js --dest=models/tag
# Adding model scaffold to your project.
# 
#   Writing new models/tag.js - done!
#   Rewriting your index.js - done!
# 
# Finished! We did the best we could, you might gut check your files though.
${'```'}
`;

module.exports = scaffold;
