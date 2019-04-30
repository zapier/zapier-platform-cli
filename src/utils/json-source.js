'use-strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { format } = require('prettier');

// function convertAuth(auth, ROOT) {
//   if (!auth) {
//     return;
//   }

//   const { type, test: authTest, fields, connectionLabel, ...scheme } = auth;
//   const templateContext = {
//     type,
//     authTest,
//     fields,
//     connectionLabel,
//     scheme...(type.includes('oauth') && scheme)
//   };

//   const prefile = fs.writeFileSync(`${ROOT}/authentication.js`, file);
// }

// Not sure if service is the right name? What kind of data type is a trigger/creates/searches?
// appComponent or apiResource?
function makeConvertService(ROOT) {
  return ([serviceType, services]) => {
    console.log(`Converting ${serviceType}`);
    const dirPath = path.join(ROOT, serviceType);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    return Object.values(services).map(service => {
      const { key, noun, display, operation, sample } = service;
      const prefile = {
        key,
        noun,
        display,
        operation,
        sample
      };

      let tokens = {};

      const { source } = operation.perform || {};
      if (source) {
        const token = `__PERFORM_SOURCE_${key}__`;
        tokens[token] = `(z, bundle) => {\n${source}\n}`;
        prefile.operation.perform = token;
      }

      if (Array.isArray(operation.inputFields)) {
        prefile.operation.inputFields.forEach((field, index) => {
          if (field.source) {
            const token = `__FIELD_SOURCE_${field.index}__`;
            tokens[token] = `(z, bundle) => {\n${field.source}\n}`;
            prefile.operation.inputFields[index] = token;
          }
        });
      }

      let stringified = JSON.stringify(prefile, null, 2);

      Object.keys(tokens).forEach(token => {
        stringified = stringified.replace(`"${token}"`, tokens[token]);
      });

      const file = `module.exports = ${stringified}`;

      fs.writeFileSync(
        `${dirPath}/${service.key}.js`,
        format(file, { singleQuote: true }),
        'utf-8'
      );

      return key;
      // Old idea of structuring each line we'd be adding here
      // return {
      //   [key]: `require('./${serviceType}/${key}')`
      // };
    });
  };
}

// The idea here was to use _.template to build out the index file.
function createIndex(sources, meta) {
  const imports = _.flatMap(Object.entries(sources), ([type, keys]) =>
    keys.map(key => `const ${key} = require('./${type}/${key}');`)
  ).join('\n');

  const serviceDefinitions = Object.entries(sources).reduce(
    (definitions, [serviceType, keys]) => {
      definitions[serviceType] = keys.reduce((allServices, service) => {
        allServices[`[${service}.key]`] = service;
        return allServices;
      }, {});

      return definitions;
    },
    {}
  );

  console.log({ imports, serviceDefinitions });
}

// We should probably be sending definition_override as the app rather than getting here.
// Anything else besides the app schema would come in via meta.
function scaffoldFrom({ definition_override, ...meta }, ROOT) {
  const {
    authentication,
    version,
    platformVersion,
    ...apiData
  } = definition_override;
  const convertService = makeConvertService(ROOT);

  // I don't think an app could be large enough to actually run slowly, but
  // one of the cleanups I was going to do was to do was to wrap the fs functions in utils.promisify.
  // Then we can use Promise.all for each definition type (triggers, services etc...) and create
  // index.js once those operations complete.
  const sources = Object.entries(apiData).reduce((acc, service) => {
    const [type] = service;
    acc[type] = convertService(service);
    return acc;
  }, {});
  // convertAuth(authentication, ROOT);
  createIndex(sources);
}

module.exports = scaffoldFrom;
