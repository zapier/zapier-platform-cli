const _ = require('lodash');
const path = require('path');
const {camelCase, snakeCase} = require('./misc');
const {readFile, writeFile, ensureDir} = require('./files');
const {printStarting, printDone} = require('./display');

const MIN_HELP_TEXT_LENGTH = 10;
const TEMPLATE_DIR = path.join(__dirname, '../../scaffold/convert');

// map WB auth types to CLI
const authTypeMap = {
  'Basic Auth': 'basic',
  // TODO: 'OAuth V1 (beta)': 'oauth1',
  'OAuth V2': 'oauth2',
  'OAuth V2 (w/refresh)': 'oauth2-refresh',
  'API Key (Headers)': 'api-header',
  'API Key (Query String)': 'api-query',
  // TODO: 'Session Auth': 'session',
  // TODO: 'Digest Auth': 'digest',
  'Unknown Auth': 'custom',
};

// map WB field types to CLI
const typesMap = {
  unicode: 'string',
  textarea: 'text',
  integer: 'integer',
  float: 'number',
  boolean: 'boolean',
  datetime: 'datetime',
  file: 'file',
  password: 'password'
};

// map WB step names to CLI
const stepNamesMap = {
  triggers: 'trigger',
  searches: 'search',
  actions: 'create'
};

// map CLI step names to verbs for display labels
const stepVerbsMap = {
  trigger: 'Get',
  create: 'Create',
  search: 'Find'
};

// map CLI step names to templates for descriptions
const stepDescriptionTemplateMap = {
  trigger: _.template('Triggers on a new <%= lowerNoun %>.'),
  create: _.template('Creates a <%= lowerNoun %>.'),
  search: _.template('Finds a <%= lowerNoun %>.')
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
  const type = definition.type && typesMap[definition.type.toLowerCase()] || 'string';

  let props = [];

  props.push(renderProp('key', quote(key)));
  if (definition.label) {
    props.push(renderProp('label', quote(definition.label)));
  }
  props.push(renderProp('helpText', quote(padHelpText(definition.help_text))));
  props.push(renderProp('type', quote(type)));
  props.push(renderProp('required', Boolean(definition.required)));

  if (definition.placeholder) {
    props.push(renderProp('placeholder', quote(definition.placeholder)));
  }

  props = props.map(s => ' '.repeat(8) + s);

  return `      {
${props.join(',\n')}
      }`;
};

const renderSampleField = (def) => {
  const type = typesMap[def.type] || 'string';
  if (def.label) {
    return `      {
        key: ${quote(def.key)},
        type: ${quote(type)},
        label: ${quote(def.label)}
      }`;
  }

  return `      {
        key: ${quote(def.key)},
        type: ${quote(type)}
      }`;
};

const renderSample = (definition) => {
  const fields = _.map(definition.sample_result_fields, renderSampleField);

  if (!fields.length) {
    return '';
  }

  return `    outputFields: [
${fields.join(',\n')}
    ]`;
};

const renderAuthTemplate = (authType, definition) => {
  const fields = _.map(definition.auth_fields, renderField);

  const auth = `{
    type: '${authType}',
    test: AuthTest.operation.perform,
    fields: [
${fields.join(',\n')}
    ]
  }`;

  return Promise.resolve(auth);
};

const renderBasicAuth = _.bind(renderAuthTemplate, null, 'basic');
const renderCustomAuth = _.bind(renderAuthTemplate, null, 'custom');

const renderOAuth2 = (definition, autoRefresh) => {
  const authorizeUrl = _.get(definition, ['general', 'auth_urls', 'authorization_url'], 'TODO');
  const accessTokenUrl = _.get(definition, ['general', 'auth_urls', 'access_token_url'], 'TODO');

  const templateContext = {
    AUTHORIZE_URL: authorizeUrl,
    ACCESS_TOKEN_URL: accessTokenUrl,
    AUTO_REFRESH: Boolean(autoRefresh),
  };

  const templateFile = path.join(TEMPLATE_DIR, '/oauth2.template.js');
  return renderTemplate(templateFile, templateContext);
};

const renderAuth = (definition) => {
  const type = authTypeMap[definition.general.auth_type];

  if (type === 'basic') {
    return renderBasicAuth(definition);
  } else if (type === 'oauth2') {
    return renderOAuth2(definition);
  } else if (type === 'oauth2-refresh') {
    return renderOAuth2(definition, true);
  } else if (type === 'custom' || type === 'api-header' || type === 'api-query') {
    return renderCustomAuth(definition);
  } else {
    return Promise.resolve(`{
    // TODO: complete auth settings
  }`);
  }
};

// Get some quick converted metadata for several templates to use
const getMetaData = (definition) => {
  const type = authTypeMap[definition.general.auth_type];

  const hasBefore = (type === 'api-header' || type === 'api-query' || type === 'session' || type === 'oauth2' || type === 'oauth2-refresh');
  const hasAfter = (type === 'session');
  const fieldsOnQuery = (type === 'api-query');

  return {
    hasBefore,
    hasAfter,
    fieldsOnQuery,
  };
};

// Generate methods for beforeRequest and afterResponse
const getHeader = (definition) => {
  const {
    hasBefore,
    hasAfter,
    fieldsOnQuery,
  } = getMetaData(definition);

  if (hasBefore || hasAfter) {
    const templateContext = {
      before: hasBefore,
      after: hasAfter,
      fields: Object.keys(definition.auth_fields),
      mapping: _.get(definition, ['general', 'auth_mapping'], {}),
      query: fieldsOnQuery,
    };
    const templateFile = path.join(TEMPLATE_DIR, '/header.template.js');
    return renderTemplate(templateFile, templateContext);
  } else {
    return Promise.resolve('');
  }
};

// Return methods to use for beforeRequest
const getBeforeRequests = (definition) => {
  const { hasBefore } = getMetaData(definition);

  if (hasBefore) {
    return 'maybeIncludeAuth';
  }

  return null;
};

// Return methods to use for afterResponse
const getAfterResponses = (definition) => {
  const { hasAfter } = getMetaData(definition);

  if (hasAfter) {
    return 'maybeRefresh';
  }

  return null;
};

// convert a trigger, create or search
const renderStep = (type, definition, key) => {
  const fields = _.map(definition.fields, renderField);
  const sample = !_.isEmpty(definition.sample_result_fields) ? renderSample(definition) + ',\n' : '';

  const url = definition.url ?
    quote(definition.url) + ',' :
    `'http://example.com/api/${key}.json', // TODO this is just an example`;

  const noun = definition.noun || _.capitalize(key);
  const label = definition.label || `${stepVerbsMap[type]} ${noun}`;

  const lowerNoun = noun.toLowerCase();
  let description = definition.help_text ||
                    stepDescriptionTemplateMap[type]({lowerNoun: lowerNoun});
  description = description.replace(/'/g, "\\'");

  const templateContext = {
    KEY: snakeCase(key),
    CAMEL: camelCase(key),
    NOUN: noun,
    LOWER_NOUN: lowerNoun,
    DESCRIPTION: description,
    LABEL: label,
    FIELDS: fields.join(',\n'),
    SAMPLE: sample,
    URL: url
  };

  const templateFile = path.join(TEMPLATE_DIR, `/${type}.template.js`);
  return renderTemplate(templateFile, templateContext);
};

// write a new trigger, create, or search
const writeStep = (type, definition, key, newAppDir) => {
  const stepTypeMap = {
    trigger: 'triggers',
    search: 'searches',
    create: 'creates'
  };

  const fileName = `${stepTypeMap[type]}/${snakeCase(key)}.js`;

  return renderStep(type, definition, key)
    .then(content => createFile(content, fileName, newAppDir));
};

const renderIndex = (legacyApp) => {
  const templateContext = {
    AUTHENTICATION: '',
    HEADER: '',
    TRIGGERS: '',
    SEARCHES: '',
    CREATES: '',
    BEFORE_REQUESTS: getBeforeRequests(legacyApp),
    AFTER_RESPONSES: getAfterResponses(legacyApp),
  };

  return renderAuth(legacyApp)
    .then((auth) => {
      templateContext.AUTHENTICATION = auth;
      return getHeader(legacyApp);
    })
    .then((header) => {
      templateContext.HEADER = header;

      const importLines = [];

      const dirMap = {
        trigger: 'triggers',
        search: 'searches',
        create: 'creates'
      };

      _.each(stepNamesMap, (cliType, wbType) => {
        const lines = [];

        _.each(legacyApp[wbType], (definition, name) => {
          const varName = `${camelCase(name)}${_.capitalize(camelCase(cliType))}`;
          const requireFile = `${dirMap[cliType]}/${snakeCase(name)}`;
          importLines.push(`const ${varName} = require('./${requireFile}');`);

          if (cliType === 'trigger' && _.get(legacyApp, ['general', 'test_trigger_key']) === name) {
            importLines.push(`const AuthTest = ${varName};`);
          }

          lines.push(`[${varName}.key]: ${varName},`);
        });

        const section = dirMap[cliType].toUpperCase();
        templateContext[section] = lines.join(',\n');
      });

      templateContext.REQUIRES = importLines.join('\n');

      const templateFile = path.join(TEMPLATE_DIR, '/index.template.js');
      return renderTemplate(templateFile, templateContext);
    });
};

const writeIndex = (legacyApp, newAppDir) => {
  return renderIndex(legacyApp)
    .then(content => createFile(content, 'index.js', newAppDir));
};

const renderPackageJson = (legacyApp) => {
  const templateContext = {
    NAME: _.kebabCase(legacyApp.general.title),
    DESCRIPTION: legacyApp.general.description,
    ZAPIER_CORE_VERSION: require('../../package.json').version
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
  _.each(stepNamesMap, (cliType, wbType) => {
    _.each(legacyApp[wbType], (definition, key) => {
      promises.push(writeStep(cliType, definition, key, newAppDir));
    });
  });

  promises.push(writeIndex(legacyApp, newAppDir));
  promises.push(writePackageJson(legacyApp, newAppDir));

  return Promise.all(promises);
};

module.exports = {
  convertApp,
  renderAuth,
  renderField,
  renderSample,
  renderStep,
  renderTemplate,
};
