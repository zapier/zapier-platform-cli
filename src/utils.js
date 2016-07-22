const constants = require('./constants');

const crypto = require('crypto');
const qs = require('querystring');
const cp = require('child_process');
const fs = require('fs');
const os = require('os');
const readline = require('readline');
const path = require('path');

const _ = require('lodash');
const AdmZip = require('adm-zip');
const fse = require('fs-extra');
const fetch = require('node-fetch');
const Table = require('cli-table2');

const rewriteLabels = (rows, columnDefs) => {
  return rows.map((row) => {
    const consumptionRow = {};
    columnDefs.forEach((columnDef) => {
      const [label, key] = columnDef;
      let val = row[key];
      consumptionRow[label] = val;
    });
    return consumptionRow;
  });
};

// Wraps the easy-table library. Rows is an array of objects,
// columnDefs an ordered sub-array [[label, key], ...].
const makeTable = (rows, columnDefs) => {
  const table = new Table({
    head: columnDefs.map(([label]) => label),
    style: {
      compact: true,
      head: ['bold']
    }
  });

  rows.forEach((row) => {
    const consumptionRow = [];
    columnDefs.forEach((columnDef) => {
      const [label, key] = columnDef;
      let val = row[key || label];
      if (val === undefined) {
        val = '';
      }
      consumptionRow.push(String(val).trim());
    });
    table.push(consumptionRow);
  });

  return table.toString().trim();
};

const printData = (rows, columnDefs) => {
  if (global.argOpts.json) {
    console.log(prettyJSONstringify(rewriteLabels(rows, columnDefs)));
  } else if (global.argOpts['json-raw']) {
    console.log(prettyJSONstringify(rows));
  } else {
    console.log(makeTable(rows, columnDefs));
  }
};

const argParse = (argv) => {
  var args = [], opts = {};
  argv.forEach((arg) => {
    if (arg.startsWith('--')) {
      var key = arg.split('=', 1)[0].replace('--', '');
      var val = arg.split('=').slice(1).join('=');
      if (val === '') {
        val = true;
      } else if (val.toLowerCase() === 'false') {
        val = false;
      }
      opts[key] = val;
    } else {
      args.push(arg);
    }
  });
  return [args, opts];
};

const prettyJSONstringify = (obj) => {
  return JSON.stringify(obj, null, '  ');
};

const printStarting = (msg) => {
  process.stdout.write(msg + '... ');
};

const printDone = () => {
  console.log('done!');
};

const fixHome = (dir) => {
  var home = process.env.HOME || process.env.USERPROFILE;
  return dir.replace('~', home);
};

// Get input from a user.
const getInput = (question) => {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

// Returns a promise that assists "callback to promise" conversions.
const makePromise = () => {
  let resolve, reject;
  var promise = new Promise((rs, rj) => {
    resolve = rs;
    reject = rj;
  });
  promise.callback = (err, ...args) => {
    if (err) {
      reject(err);
    } else {
      resolve(...args);
    }
  };
  return promise;
};

// Returns a promise that reads a file and returns a buffer.
const readFile = (fileName, errMsg) => {
  return new Promise((resolve, reject) => {
    fs.exists(fixHome(fileName), (exists) => {
      if (!exists) {
        var msg = `: File ${fileName} not found.`;
        if (errMsg) {
          msg += ` ${errMsg}`;
        }
        return reject(new Error(msg));
      }
      fs.readFile(fixHome(fileName), (err, buf) => {
        if (err) {
          reject(err);
        } else {
          resolve(buf);
        }
      });
      return true;
    });
  });
};

// Returns a promise that writes a file.
const writeFile = (fileName, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fixHome(fileName), data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Returns a promise that copies a directory.
const copyDir = (src, dest, options) => {
  options = options || {};
  var defaultFilter = (dir) => {
    var isntPackage = dir.indexOf('node_modules') === -1;
    var isntBuild = dir.indexOf('.zip') === -1;
    return isntPackage && isntBuild;
  };
  options.filter = options.filter || defaultFilter;
  return new Promise((resolve, reject) => {
    fse.copy(src, dest, options, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

// Returns a promise that ensures a directory exists.
const ensureDir = (dir) => {
  return new Promise((resolve, reject) => {
    fse.ensureDir(dir, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

// Reads the JSON file at ~/.zapier-platform (AUTH_LOCATION).
const readCredentials = (credentials) => {
  return Promise.resolve(
    credentials ||
    readFile(constants.AUTH_LOCATION, 'Please run "zapier config".')
      .then((buf) => {
        return JSON.parse(buf.toString());
      })
  );
};

// Delete a directory.
const removeDir = (dir) => {
  return new Promise((resolve, reject) => {
    fse.remove(dir, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

// Run a command with a promise.
const runCommand = (command, options) => {
  options = options || {};
  return new Promise((resolve, reject) => {
    cp.exec(command, options, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      resolve({
        stdout: stdout,
        stderr: stderr
      });
    });
  });
};

// Calls the underlying platform REST API with proper authentication.
const callAPI = (route, options) => {
  options = options || {};
  var requestOptions;
  return readCredentials()
    .then((credentials) => {
      requestOptions = {
        method: options.method || 'GET',
        url: constants.ENDPOINT + route,
        body: options.body ? JSON.stringify(options.body) : null,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Deploy-Key': credentials.deployKey
        }
      };
      return fetch(requestOptions.url, requestOptions);
    })
    .then((res) => {
      return Promise.all([
        res,
        res.text()
      ]);
    })
    .then(([res, text]) => {
      if (constants.DEBUG || global.argOpts.debug) {
        console.log(`>> ${requestOptions.method} ${requestOptions.url}`);
        if (requestOptions.body) { console.log(`>> ${requestOptions.body}`); }
        console.log(`<< ${res.status}`);
        console.log(`<< ${(text || '').substring(0, 2500)}\n`);
      }
      if (res.status >= 400) {
        var errors;
        try {
          errors = JSON.parse(text).errors.join(', ');
        } catch(err) {
          errors = (text || 'Unknown error').slice(0, 250);
        }
        throw new Error(`${constants.ENDPOINT} returned ${res.status} saying ${errors}`);
      }
      return JSON.parse(text);
    });
};

// Reads the JSON file at ~/.zapier-platform (AUTH_LOCATION).
const getLinkedAppConfig = () => {
  return readFile(constants.CURRENT_APP_FILE)
    .then((buf) => {
      return JSON.parse(buf.toString()).id;
    });
};

const writeLinkedAppConfig = (app) => {
  return writeFile(constants.CURRENT_APP_FILE, prettyJSONstringify({
    id: app.id,
    key: app.key
  }));
};

// Loads the linked app from the API.
const getLinkedApp = () => {
  return getLinkedAppConfig()
    .then((appId) => {
      if (!appId) {
        return {};
      }
      return callAPI('/apps/' + appId);
    })
    .catch(() => {
      throw new Error(`Warning! ${constants.CURRENT_APP_FILE} seems to be incorrect. Try running \`zapier link\` or \`zapier create\`.`);
    });
};

const checkCredentials = () => {
  return callAPI('/check');
};

const listApps = () => {
  return checkCredentials()
    .then(() => {
      return Promise.all([
        getLinkedApp()
          .catch(() => {
            return undefined;
          }),
        callAPI('/apps')
      ]);
    })
    .then((values) => {
      var [linkedApp, data] = values;
      return {
        app: linkedApp,
        apps: data.objects.map((app) => {
          app.linked = (linkedApp && app.id === linkedApp.id) ? '✔' : '';
          return app;
        })
      };
    });
};

const listEndoint = (endpoint, keyOverride) => {
  return checkCredentials()
    .then(getLinkedApp)
    .then((app) => {
      return Promise.all([
        app,
        callAPI(`/apps/${app.id}/${endpoint}`)
      ]);
    })
    .then(([app, results]) => {
      var out = {
        app: app
      };
      out[keyOverride || endpoint] = results.objects;
      return out;
    });
};

const listVersions = () => {
  return listEndoint('versions');
};

const listHistory = () => {
  return listEndoint('history');
};

const listCollaborators = () => {
  return listEndoint('collaborators');
};

const listInvitees = () => {
  return listEndoint('invitees');
};

const listLogs = (opts) => {
  return listEndoint(`logs?${qs.stringify(opts)}`, 'logs');
};

const listEnv = (version) => {
  var endpoint;
  if (version) {
    endpoint = `versions/${version}/environment`;
  } else {
    endpoint = 'environment';
  }
  return listEndoint(endpoint, 'environment');
};

const stripPath = (cwd, filePath) => filePath.split(cwd).pop();

// given an entry point, return a list of files that uses
// could probably be done better with module-deps...
// TODO: needs to include package.json files too i think
//   https://github.com/serverless/serverless-optimizer-plugin?
const browserifyFiles = (entryPoint) => {
  var browserify = require('browserify');
  var through = require('through2');

  var cwd = entryPoint + '/';
  var argv = {
    noParse: [ undefined ],
    extensions: [],
    ignoreTransform: [],
    entries: [entryPoint + '/zapierwrapper.js'],
    fullPaths: false,
    builtins: false,
    commondir: false,
    bundleExternal: true,
    basedir: undefined,
    browserField: false,
    detectGlobals: true,
    insertGlobals: false,
    insertGlobalVars: {
      process: undefined,
      global: undefined,
      'Buffer.isBuffer': undefined,
      Buffer: undefined
    },
    ignoreMissing: false,
    debug: false,
    standalone: undefined
  };
  var b = browserify(argv);

  return new Promise((resolve, reject) => {
    b.on('error', reject);

    var paths = [];
    b.pipeline.get('deps')
      .push(through.obj((row, enc, next) => {
        var filePath = row.file || row.id;
        // why does browserify add /private + filePath?
        paths.push(stripPath(cwd, filePath));
        next();
      })
      .on('end', () => {
        paths.sort();
        resolve(paths);
      }));
    b.bundle();
  });
};

const listFiles = (dir) => {
  return new Promise((resolve, reject) => {
    var paths = [];
    var cwd = dir + '/';
    fse.walk(dir)
      .on('data', (item) => {
        if (!item.stats.isDirectory()) {
          paths.push(stripPath(cwd, item.path));
        }
      })
      .on('error', reject)
      .on('end', () => {
        paths.sort();
        resolve(paths);
      });
  });
};

const makeZip = (dir, zipPath) => {
  return browserifyFiles(dir)
    .then((smartPaths) => Promise.all([
      smartPaths,
      listFiles(dir)
    ]))
    .then(([smartPaths, dumbPaths]) => {
      if (global.argOpts.dumb) {
        return dumbPaths;
      }
      var finalPaths = smartPaths.concat(dumbPaths.filter((filePath) => {
        return filePath.endsWith('package.json') || filePath.endsWith('definition.json');
      }));
      finalPaths = _.uniq(finalPaths);
      finalPaths.sort();
      return finalPaths;
    })
    .then((paths) => {
      return new Promise((resolve) => {
        var zip = new AdmZip();
        paths.forEach((filePath) => {
          var basePath = path.dirname(filePath);
          if (basePath === '.') {
            basePath = undefined;
          }
          zip.addLocalFile(path.join(dir, filePath), basePath);
        });
        zip.writeZip(zipPath);
        resolve();
      });
    });
};

const appCommand = (dir, event) => {
  var entry = require(`${dir}/zapierwrapper.js`);
  var promise = makePromise();
  event = Object.assign({}, event, {
    calledFromCli: true,
    doNotMonkeyPatchPromises: true // can drop this
  });
  entry.handler(event, {}, promise.callback);
  return promise;
};

const build = (zipPath) => {
  var wdir = process.cwd();
  zipPath = zipPath || constants.BUILD_PATH;
  var tmpDir = path.join(os.tmpdir(), 'zapier-' + crypto.randomBytes(4).toString('hex'));
  return ensureDir(tmpDir)
    .then(() => {
      printStarting('  Copying project to temp directory');
      return copyDir(wdir, tmpDir);
    })
    .then(() => {
      printDone();
      printStarting('  Installing project dependencies');
      return runCommand('npm install --production', {cwd: tmpDir});
    })
    .then(() => {
      printDone();
      printStarting('  Applying entry point file');
      // TODO: should this routine for include exist elsewhere?
      return readFile(`${tmpDir}/node_modules/${constants.PLATFORM_PACKAGE}/include/zapierwrapper.js`)
        .then(zapierWrapperBuf => writeFile(`${tmpDir}/zapierwrapper.js`, zapierWrapperBuf.toString()));
    })
    .then(() => {
      printDone();
      printStarting('  Validating project');
      return appCommand(tmpDir, {command: 'validate'});
    })
    .then((resp) => {
      var errors = resp.results;
      if (errors.length) {
        throw new Error('We hit some validation errors, try running `zapier validate` to see them!');
      } else {
        printDone();
      }
    })
    .then(() => {
      printStarting('  Building app definition.json');
      return appCommand(tmpDir, {command: 'definition'});
    })
    .then((rawDefinition) => {
      return writeFile(`${tmpDir}/definition.json`, prettyJSONstringify(rawDefinition.results));
    })
    .then(() => {
      // tries to do a reproducible build at least
      // https://blog.pivotal.io/labs/labs/barriers-deterministic-reproducible-zip-files
      // https://reproducible-builds.org/tools/ or strip-nondeterminism
      return runCommand('find . -exec touch -t 201601010000 {} +', {cwd: tmpDir});
    })
    .then(() => {
      printDone();
      printStarting('  Zipping project and dependencies');
      return makeZip(tmpDir, wdir + '/' + zipPath);
    })
    .then(() => {
      printDone();
      printStarting('  Cleaning up temp directory');
      return removeDir(tmpDir);
    })
    .then(() => {
      printDone();
      return zipPath;
    });
};

const upload = (zipPath) => {
  zipPath = zipPath || constants.BUILD_PATH;
  return getLinkedApp()
    .then((app) => {
      var zip = new AdmZip(zipPath);
      var definitionJson = zip.readAsText('definition.json');
      if (!definitionJson) {
        throw new Error('definition.json in the zip was missing!');
      }
      var definition = JSON.parse(definitionJson);

      printStarting('  Uploading version ' + definition.version);
      return callAPI(`/apps/${app.id}/versions/${definition.version}`, {
        method: 'PUT',
        body: {
          platform_version: definition.platformVersion,
          definition: definition,
          zip_file: zip.toBuffer().toString('base64')
        }
      });
    })
    .then(() => {
      printDone();
    });
};

const buildAndUploadCurrentDir = (zipPath) => {
  zipPath = zipPath || constants.BUILD_PATH;
  return checkCredentials()
    .then(() => {
      return build(zipPath);
    })
    .then(() => {
      return upload(zipPath);
    });
};

module.exports = {
  makeTable,
  printData,
  argParse,
  prettyJSONstringify,
  printStarting,
  printDone,
  makePromise,
  getInput,
  writeFile,
  readCredentials,
  removeDir,
  runCommand,
  callAPI,
  writeLinkedAppConfig,
  getLinkedApp,
  checkCredentials,
  listApps,
  listEndoint,
  listVersions,
  listHistory,
  listCollaborators,
  listInvitees,
  listLogs,
  listEnv,
  build,
  upload,
  buildAndUploadCurrentDir
};
