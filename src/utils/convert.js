const _ = require('lodash');
const path = require('path');
const {camelCase, snakeCase} = require('./misc');
const {readFile, writeFile, ensureDir} = require('./files');
const {printStarting, printDone} = require('./display');

// map v2 names to v3 names
const typeNamesMap = {
  triggers: 'trigger',
  searches: 'search',
  actions: 'write'
};

const renderTemplate = (templateFile, templateContext, fileName, dir) => {
  const destFile = path.join(dir, fileName);

  return readFile(templateFile)
    .then(templateBuf => templateBuf.toString())
    .then(template => _.template(template, {interpolate: /<%=([\s\S]+?)%>/g})(templateContext))
    .then(rendered => {
      printStarting(`Writing ${fileName}`);
      return rendered;
    })
    .then(rendered => {
      ensureDir(path.dirname(destFile))
        .then(() => writeFile(destFile, rendered));
    })
    .then(() => printDone());
};

const convertItem = (type, name, newAppDir) => {
  const templateContext = {
    KEY: snakeCase(name),
    CAMEL: camelCase(name),
    NOUN: _.capitalize(name),
    LOWER_NOUN: name.toLowerCase()
  };

  // where will we write/required the new file?
  const destMap = {
    trigger: `triggers/${templateContext.KEY}`,
    search: `searches/${templateContext.KEY}`,
    write: `writes/${templateContext.KEY}`,
  };

  const templateFile = path.join(__dirname, `../../scaffold/${type}.template.js`);
  const dest = destMap[type] + '.js';

  return renderTemplate(templateFile, templateContext, dest, newAppDir);
};

const createIndex = (legacyApp, newAppDir) => {
  const importLines = [];

  const dirMap = {
    trigger: 'triggers',
    search: 'searches',
    write: 'writes'
  };

  const templateContext = {
    TRIGGERS: '',
    SEARCHES: '',
    WRITES: ''
  };

  _.each(typeNamesMap, (v3Type, v2Type) => {
    const lines = [];

    _.each(legacyApp[v2Type], (definition, name) => {
      const varName = `${camelCase(name)}${_.capitalize(camelCase(v3Type))}`;
      const requireFile = `${dirMap[v3Type]}/${snakeCase(name)}`;
      importLines.push(`const ${varName} = require('./${requireFile}');`);

      lines.push(`[${varName}.key]: ${varName},`);
    });

    const section = dirMap[v3Type].toUpperCase();
    templateContext[section] = lines.join(',\n');
  });

  templateContext.REQUIRES = importLines.join('\n');

  const templateFile = path.join(__dirname, '../../scaffold/index.template.js');
  return renderTemplate(templateFile, templateContext, 'index.js', newAppDir);
};

const createPackageJson = (legacyApp, newAppDir) => {
  const templateContext = {
    NAME: _.kebabCase(legacyApp.general.title),
    DESCRIPTION: legacyApp.general.description
  };

  const templateFile = path.join(__dirname, '../../scaffold/package.template.json');
  return renderTemplate(templateFile, templateContext, 'package.json', newAppDir);
};

const convertApp = (legacyApp, newAppDir) => {
  const promises = [];
  _.each(typeNamesMap, (v3Type, v2Type) => {
    _.each(legacyApp[v2Type], (definition, name) => {
      promises.push(convertItem(v3Type, name, newAppDir));
    });
  });

  promises.push(createIndex(legacyApp, newAppDir));
  promises.push(createPackageJson(legacyApp, newAppDir));

  return Promise.all(promises);
};

module.exports = {
  convertApp
};
