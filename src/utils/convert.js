const path = require('path');

const _ = require('lodash');
const prettier = require('prettier');

const { PACKAGE_VERSION } = require('../constants');
const { startSpinner, endSpinner } = require('./display');
const { ensureDir, readFile, writeFile } = require('./files');
const { snakeCase } = require('./misc');
const { getPackageLatestVersion } = require('./npm');

const TEMPLATE_DIR = path.join(__dirname, '../../scaffold/convert');

// A placeholder that can be used to identify this is something we need to replace
// before generating the final code. See replacePlaceholders function. Make it really
// special and NO regex reserved chars.
const REPLACE_DIRECTIVE = '__REPLACE_ME@';

const makePlaceholder = replacement => `${REPLACE_DIRECTIVE}${replacement}`;

const replacePlaceholders = str =>
  str.replace(new RegExp(`"${REPLACE_DIRECTIVE}([^"]+)"`, 'g'), '$1');

const createFile = (content, fileName, dir) => {
  const destFile = path.join(dir, fileName);

  return ensureDir(path.dirname(destFile))
    .then(() => writeFile(destFile, content))
    .then(() => {
      startSpinner(`Writing ${fileName}`);
      endSpinner();
    });
};

const prettifyJs = code => prettier.format(code, { singleQuote: true });

const renderTemplate = async (
  templateFile,
  templateContext,
  prettify = true
) => {
  const templateBuf = await readFile(templateFile);
  const template = templateBuf.toString();
  let content = _.template(template, { interpolate: /<%=([\s\S]+?)%>/g })(
    templateContext
  );

  if (prettify) {
    const ext = path.extname(templateFile).toLowerCase();
    const prettifier = {
      '.json': origString => JSON.stringify(JSON.parse(origString), null, 2),
      '.js': prettifyJs
    }[ext];
    if (prettifier) {
      content = prettifier(content);
    }
  }

  return content;
};

const renderPackageJson = async (legacyApp, appDefinition) => {
  // Not using escapeSpecialChars because we don't want to escape single quotes (not
  // allowed in JSON)
  const description = legacyApp.general.description
    .replace(/\n/g, '\\n')
    .replace(/"/g, '\\"');

  const runnerVersion = await getPackageLatestVersion(
    'zapier-platform-legacy-scripting-runner'
  );

  const templateContext = {
    NAME: _.kebabCase(legacyApp.general.title),
    DESCRIPTION: description,
    APP_ID: legacyApp.general.app_id,
    CLI_VERSION: PACKAGE_VERSION,
    CORE_VERSION: appDefinition.platformVersion,
    RUNNER_VERSION: runnerVersion
  };

  const templateFile = path.join(TEMPLATE_DIR, '/package.template.json');
  return renderTemplate(templateFile, templateContext);
};

const renderStep = (type, definition) => {
  let exportBlock = _.cloneDeep(definition),
    functionBlock = '';

  ['perform', 'performList', 'performSubscribe', 'performUnsubscribe'].forEach(
    funcName => {
      const func = definition.operation[funcName];
      if (func && func.source) {
        const args = func.args || ['z', 'bundle'];
        functionBlock += `const ${funcName} = (${args.join(', ')}) => {${
          func.source
        }};\n\n`;

        exportBlock.operation[funcName] = makePlaceholder(funcName);
      }
    }
  );

  ['inputFields', 'outputFields'].forEach(key => {
    const fields = definition.operation[key];
    if (Array.isArray(fields) && fields.length > 0) {
      // Backend converter always put custom field function at the end of the array
      const func = fields[fields.length - 1];
      if (func && func.source) {
        const args = func.args || ['z', 'bundle'];
        const funcName = `get${_.upperFirst(key)}`;
        functionBlock += `const ${funcName} = (${args.join(', ')}) => {${
          func.source
        }};\n\n`;

        exportBlock.operation[key][fields.length - 1] = makePlaceholder(
          funcName
        );
      }
    }
  });

  exportBlock = `module.exports = ${replacePlaceholders(
    JSON.stringify(exportBlock)
  )};\n`;

  return prettifyJs(functionBlock + exportBlock);
};

const renderAuth = async appDefinition => {
  let exportBlock = _.cloneDeep(appDefinition.authentication),
    functionBlock = '';

  _.each(
    {
      connectionLabel: 'getConnectionLabel',
      test: 'testAuth'
    },
    (funcName, key) => {
      const func = appDefinition.authentication[key];
      if (func && func.source) {
        const args = func.args || ['z', 'bundle'];
        functionBlock += `const ${funcName} = (${args.join(', ')}) => {${
          func.source
        }};\n\n`;

        exportBlock[key] = makePlaceholder(funcName);
      }
    }
  );

  exportBlock = `module.exports = ${replacePlaceholders(
    JSON.stringify(exportBlock)
  )};\n`;

  return prettifyJs(functionBlock + exportBlock);
};

const renderHydrators = async appDefinition => {
  let exportBlock = _.cloneDeep(appDefinition.hydrators),
    functionBlock = '';

  _.each(appDefinition.hydrators, (func, funcName) => {
    if (func && func.source) {
      const args = func.args || ['z', 'bundle'];
      functionBlock += `const ${funcName} = (${args.join(', ')}) => {${
        func.source
      }};\n\n`;
      exportBlock[funcName] = makePlaceholder(funcName);
    }
  });

  exportBlock = `module.exports = ${replacePlaceholders(
    JSON.stringify(exportBlock)
  )};\n`;

  return prettifyJs(functionBlock + exportBlock);
};

const renderIndex = async appDefinition => {
  let exportBlock = _.cloneDeep(appDefinition),
    functionBlock = '',
    importBlock = '';

  if (appDefinition.authentication) {
    importBlock += "const authentication = require('./authentication');\n";
    exportBlock.authentication = makePlaceholder('authentication');
  }

  _.each(
    {
      triggers: 'Trigger',
      creates: 'Create',
      searches: 'Search'
    },
    (importNameSuffix, stepType) => {
      _.each(appDefinition[stepType], (definition, key) => {
        const importName = _.camelCase(key) + importNameSuffix;
        const filepath = `./${stepType}/${_.snakeCase(key)}.js`;

        importBlock += `const ${importName} = require('${filepath}');\n`;

        delete exportBlock[stepType][key];
        exportBlock[stepType][
          makePlaceholder(`[${importName}.key]`)
        ] = makePlaceholder(importName);
      });
    }
  );

  if (!_.isEmpty(appDefinition.hydrators)) {
    importBlock += "const hydrators = require('./hydrators');\n";
    exportBlock.hydrators = makePlaceholder('hydrators');
  }

  ['beforeRequest', 'afterResponse'].forEach(middlewareType => {
    const middlewares = appDefinition[middlewareType];
    if (middlewares && middlewares.length > 0) {
      // Backend converter always generates only one middleware
      const func = middlewares[0];
      if (func.source) {
        const args = func.args || ['z', 'bundle'];
        const funcName = middlewareType;
        functionBlock += `const ${funcName} = (${args.join(', ')}) => {${
          func.source
        }};\n\n`;

        exportBlock[middlewareType][0] = makePlaceholder(funcName);
      }
    }
  });

  if (appDefinition.legacy && appDefinition.legacy.scriptingSource) {
    importBlock += "\nconst fs = require('fs');\n";
    importBlock +=
      "const scriptingSource = fs.readFileSync('./scripting.js');\n\n";
    exportBlock.legacy.scriptingSource = makePlaceholder('scriptingSource');
  }

  exportBlock = `module.exports = ${replacePlaceholders(
    JSON.stringify(exportBlock)
  )};`;

  return prettifyJs(importBlock + '\n' + functionBlock + exportBlock);
};

const writeStep = async (
  stepType,
  definition,
  key,
  appDefinition,
  newAppDir
) => {
  const filename = `${stepType}/${snakeCase(key)}.js`;
  const content = await renderStep(stepType, definition);
  await createFile(content, filename, newAppDir);
};

// const writeStepTest = (stepType, definition, key, appDefinition, newAppDir) => {
// };
//

const writeAuth = async (appDefinition, newAppDir) => {
  const content = await renderAuth(appDefinition, appDefinition);
  await createFile(content, 'authentication.js', newAppDir);
};

const writePackageJson = async (legacyApp, appDefinition, newAppDir) => {
  const content = await renderPackageJson(legacyApp, appDefinition);
  await createFile(content, 'package.json', newAppDir);
};

const writeHydrators = async (appDefinition, newAppDir) => {
  const content = await renderHydrators(appDefinition);
  await createFile(content, 'hydrators.js', newAppDir);
};

const writeScripting = async (appDefinition, newAppDir) => {
  await createFile(
    appDefinition.legacy.scriptingSource,
    'scripting.js',
    newAppDir
  );
};

const writeIndex = async (appDefinition, newAppDir) => {
  const content = await renderIndex(appDefinition);
  await createFile(content, 'index.js', newAppDir);
};

const convertApp = async (legacyApp, appDefinition, newAppDir) => {
  const promises = [];

  ['triggers', 'creates', 'searches'].forEach(stepType => {
    _.each(appDefinition[stepType], (definition, key) => {
      promises.push(
        writeStep(stepType, definition, key, appDefinition, newAppDir)
      );
      // promises.push(
      //   writeStepTest(stepType, definition, key, appDefinition, newAppDir)
      // );
    });
  });

  if (!_.isEmpty(appDefinition.authentication)) {
    promises.push(writeAuth(appDefinition, newAppDir));
  }
  if (!_.isEmpty(appDefinition.hydrators)) {
    promises.push(writeHydrators(appDefinition, newAppDir));
  }
  if (_.get(appDefinition, 'legacy.scriptingSource')) {
    promises.push(writeScripting(appDefinition, newAppDir));
  }

  promises.push(writePackageJson(legacyApp, appDefinition, newAppDir));
  promises.push(writeIndex(appDefinition, newAppDir));
  // promises.push(writeEnvironment(appDefinition, newAppDir));
  // promises.push(writeGitIgnore(newAppDir));

  return await Promise.all(promises);
};

module.exports = {
  convertApp
};
