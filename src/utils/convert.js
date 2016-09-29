const _ = require('lodash');
const path = require('path');
const {camelCase, snakeCase} = require('./misc');
const {readFile, writeFile, ensureDir} = require('./files');
const {printStarting, printDone} = require('./display');

const MIN_HELP_TEXT_LENGTH = 10;
const TEMPLATE_DIR = path.join(__dirname, '../../scaffold/convert');

// map v2 field types to v2 types
const typesMap = {
  Unicode: 'string',
  Textarea: 'text',
  Integer: 'integer',
  Float: 'number',
  Boolean: 'boolean',
  DateTime: 'datetime',
  File: 'file',
  Password: 'password'
};

// map v2 step names to v3 names
const stepNamesMap = {
  triggers: 'trigger',
  searches: 'search',
  actions: 'write'
};

const renderTemplate = (templateFile, templateContext) => {
  return readFile(templateFile)
    .then(templateBuf => templateBuf.toString())
    .then(template => _.template(template, {interpolate: /<%=([\s\S]+?)%>/g})(templateContext));
};

const createFile = (content, fileName, dir) => {
  const destFile = path.join(dir, fileName);

  return ensureDir(path.dirname(destFile))
    .then(() => writeFile(destFile, content))
    .then(() => {
      printStarting(`Writing ${fileName}`);
      printDone();
    });
};

const padHelpText = (text) => {
  const msg = `(help text must be at least ${MIN_HELP_TEXT_LENGTH} characters)`;
  if (!_.isString(text)) {
    return msg;
  }
  if (text.length < MIN_HELP_TEXT_LENGTH) {
    return `${text} ${msg}`;
  }
  return text;
};

const renderProp = (key, value) => `${key}: ${value}`;

const quote = s => `'${s}'`;

const renderField = (definition, key) => {
  let props = [
    renderProp('key', quote(key)),
    renderProp('label', quote(definition.label)),
    renderProp('helpText', quote(padHelpText(definition.help_text))),
    renderProp('type', quote(typesMap[definition.type] || 'string')),
    renderProp('required', Boolean(definition.required))
  ];

  if (definition.placeholder) {
    props.push(renderProp('placeholder', quote(definition.placeholder)));
  }

  props = props.map(s => ' '.repeat(8) + s);

  return `      {
${props.join(',\n')}
      }`;
};

// convert a trigger, write or search
const renderStep = (type, definition, key) => {
  const templateContext = {
    KEY: snakeCase(key),
    CAMEL: camelCase(key),
    NOUN: _.capitalize(key),
    LOWER_NOUN: key.toLowerCase()
  };

  const templateFile = path.join(TEMPLATE_DIR, `/${type}.template.js`);
  const fields = _.map(definition.fields, renderField);
  templateContext.FIELDS = fields.join(',\n');
  return renderTemplate(templateFile, templateContext);
};

// write a new trigger, write or search
const writeStep = (type, definition, key, newAppDir) => {
  const stepTypeMap = {
    trigger: 'triggers',
    search: 'searches',
    write: 'writes'
  };

  const fileName = `${stepTypeMap[type]}/${snakeCase(key)}.js`;

  return renderStep(type, definition, key)
    .then(content => createFile(content, fileName, newAppDir));
};

const renderIndex = (legacyApp) => {
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

  _.each(stepNamesMap, (v3Type, v2Type) => {
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

  const templateFile = path.join(TEMPLATE_DIR, '/index.template.js');
  return renderTemplate(templateFile, templateContext);
};

const writeIndex = (legacyApp, newAppDir) => {
  return renderIndex(legacyApp)
    .then(content => createFile(content, 'index.js', newAppDir));
};

const renderPackageJson = (legacyApp) => {
  const templateContext = {
    NAME: _.kebabCase(legacyApp.general.title),
    DESCRIPTION: legacyApp.general.description
  };

  const templateFile = path.join(TEMPLATE_DIR, '/package.template.json');
  return renderTemplate(templateFile, templateContext);
};

const writePackageJson = (legacyApp, newAppDir) => {
  return renderPackageJson(legacyApp)
    .then(content => createFile(content, 'package.json', newAppDir));
};

const convertApp = (legacyApp, newAppDir) => {
  const promises = [];
  _.each(stepNamesMap, (v3Type, v2Type) => {
    _.each(legacyApp[v2Type], (definition, key) => {
      promises.push(writeStep(v3Type, definition, key, newAppDir));
    });
  });

  promises.push(writeIndex(legacyApp, newAppDir));
  promises.push(writePackageJson(legacyApp, newAppDir));

  return Promise.all(promises);
};

module.exports = {
  renderField,
  convertApp
};
