var constants = require('./constants');

var crypto = require('crypto');
var qs = require('querystring');
var cp = require('child_process');
var fs = require('fs');
var os = require('os');
var readline = require('readline');
var path = require('path');

var AdmZip = require('adm-zip');
var fse = require('fs-extra');
var fetch = require('node-fetch');
var Table = require('easy-table');

// Wraps the easy-table library. Rows is an array of objects,
// columnDefs an ordered sub-array [[label, key], ...].
var makeTable = (rows, columnDefs) => {
  var t = new Table();

  if (rows && rows.length) {
    rows.forEach((row) => {
      columnDefs.forEach((columnDef) => {
        var [label, key] = columnDef;
        t.cell(label, String(row[key]).trim());
      });
      t.newRow();
    });
  } else {
    // write an empty row so we can get the headers
    // follow up trim will nuke the line of whitespace
    columnDefs.forEach((columnDef) => {
      var label = columnDef[0];
      t.cell(label, '');
    });
    t.newRow();
  }

  return t.toString().trim();
};

var printTable = (rows, columnDefs) => {
  console.log(makeTable(rows, columnDefs));
};

var argParse = (argv) => {
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

var prettyJSONstringify = (obj) => {
  return JSON.stringify(obj, null, '  ');
};

var printStarting = (msg) => {
  process.stdout.write(msg + '... ');
};

var printDone = () => {
  console.log('done!');
};

var fixHome = (dir) => {
  var home = process.env.HOME || process.env.USERPROFILE;
  return dir.replace('~', home);
};

// Get input from a user.
var getInput = (question) => {
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
var makePromise = () => {
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
var readFile = (fileName, errMsg) => {
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
    });
  });
};

// Returns a promise that writes a file.
var writeFile = (fileName, data) => {
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
var copyDir = (src, dest, options) => {
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
var ensureDir = (dir) => {
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
var readCredentials = (credentials) => {
  return Promise.resolve(
    credentials ||
    readFile(constants.AUTH_LOCATION, 'Please run "zapier config".')
      .then((buf) => {
        return JSON.parse(buf.toString());
      })
  );
};

// Delete a directory.
var removeDir = (dir) => {
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
var runCommand = (command, options) => {
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
var callAPI = (route, options) => {
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
      if (constants.DEBUG) {
        console.log(`>> ${requestOptions.method} ${requestOptions.url}`);
        if (requestOptions.body) { console.log(`>> ${requestOptions.body}`); }
        console.log(`<< ${res.status}`);
        console.log(`<< ${(text || '').substring(0, 250)}\n`);
      }
      if (res.status >= 400) {
        var errors;
        try {
          errors = JSON.parse(text).errors.join(', ');
        } catch(err) {
          errors = (text || 'Unknown error').slice(0, 250);
        }
        throw new Error(`${constants.BASE_ENDPOINT} returned ${res.status} saying ${errors}`);
      }
      return JSON.parse(text);
    });
};

// Reads the JSON file at ~/.zapier-platform (AUTH_LOCATION).
var getLinkedAppConfig = () => {
  return readFile(constants.CURRENT_APP_FILE)
    .then((buf) => {
      return JSON.parse(buf.toString()).id;
    });
};

var writeLinkedAppConfig = (app) => {
  return writeFile(constants.CURRENT_APP_FILE, prettyJSONstringify({
    id: app.id,
    key: app.key
  }));
};

// Loads the linked app from the API.
var getLinkedApp = () => {
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

var checkCredentials = () => {
  return callAPI('/check');
};

var listApps = () => {
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

var listEndoint = (endpoint, key) => {
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
      out[key || endpoint] = results.objects;
      return out;
    });
};

var listVersions = () => {
  return listEndoint('versions');
};

var listHistory = () => {
  return listEndoint('history');
};

var listLogs = (opts) => {
  return listEndoint(`logs?${qs.stringify(opts)}`, 'logs');
};

var listEnv = (version) => {
  var endpoint;
  if (version) {
    endpoint = `versions/${version}/environment`;
  } else {
    endpoint = `environment`;
  }
  return listEndoint(endpoint, 'environment');
};

var stripPath = (cwd, filePath) => filePath.replace(cwd, '');

// given an entry point, return a list of files that uses
// could probably be done better with module-deps...
// TODO: needs to include package.json files too i think
//   https://github.com/serverless/serverless-optimizer-plugin?
var browserifyFiles = (entryPoint) => {
  var browserify = require('browserify');
  var through = require('through2');

  var cwd = process.cwd() + '/';
  var argv = {
    noParse: [ undefined ],
    extensions: [],
    ignoreTransform: [],
    entries: [entryPoint],
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

    var output = [];
    b.pipeline.get('deps')
      .push(through.obj((row, enc, next) => {
        var filePath = row.file || row.id;
        output.push(stripPath(cwd, filePath));
        next();
      })
      .on('end', () => {
        resolve(output);
      }));
    b.bundle();
  });
};

var listFiles = (dir) => {
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

var makeZip = (dir, zipPath) => {
  return listFiles(dir)
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

var appCommand = (dir, event) => {
  var entry = require(`${dir}/zapierwrapper.js`);
  var promise = makePromise();
  entry.handler(event, {}, promise.callback);
  return promise;
};

var build = (zipPath) => {
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

var upload = (zipPath) => {
  zipPath = zipPath || constants.BUILD_PATH;
  return getLinkedApp()
    .then((app) => {
      var zip = new AdmZip(zipPath);
      var definitionJson = zip.readAsText('definition.json');
      var definition = JSON.parse(definitionJson);

      printStarting('  Uploading version ' + definition.version);
      return callAPI(`/apps/${app.id}/versions/${definition.version}`, {
        method: 'PUT',
        body: {
          platform_version: '3.0.0' || definition.platformVersion,
          definition: definition,
          zip_file: zip.toBuffer().toString('base64')
        }
      });
    })
    .then(() => {
      printDone();
    });
};

var buildAndUploadCurrentDir = (zipPath) => {
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
  printTable,
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
  listLogs,
  listEnv,
  build,
  upload,
  buildAndUploadCurrentDir
};
