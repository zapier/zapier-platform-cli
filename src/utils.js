var constants = require('./constants');

var crypto = require('crypto');
var cp = require('child_process');
var fs = require('fs');
var os = require('os');
var readline = require('readline');
var path = require('path');

var archiver = require('archiver');
var fse = require('fs-extra');
var fetch = require('node-fetch');
var Table = require('easy-table');

// Wraps the easy-table library. Rows is an array of objects,
// columnDefs an ordered sub-array [[label, key], ...].
var printTable = (rows, columnDefs) => {
  var t = new Table();

  if (rows && rows.length) {
    rows.forEach((row) => {
      columnDefs.forEach((columnDef) => {
        var label = columnDef[0], key = columnDef[1];
        t.cell(label, row[key]);
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

  console.log(t.toString().trim());
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
  console.log('writing file', fileName);
  return new Promise((resolve, reject) => {
    fs.writeFile(fixHome(fileName), data, (err) => {
      console.log('wrote file', fileName, 'err:', err);
      if (err) {
        console.log('rejected!');
        reject(err);
      } else {
        console.log('resolved');
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

// Reads the JSON file at ~/.zapier-platform (CONFIG_LOCATION).
var readCredentials = (credentials) => {
  return Promise.resolve(
    credentials ||
    readFile(constants.CONFIG_LOCATION, 'Please run "zapier config".')
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
    .then((values) => {
      var res = values[0], text = values[1];
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
        throw new Error('' + res.status + ' saying ' + errors);
      }
      return JSON.parse(text);
    });
};

// Reads the JSON file at ~/.zapier-platform (CONFIG_LOCATION).
var getCurrentAppConfig = () => {
  return readFile(constants.CURRENT_APP_FILE)
    .then((buf) => {
      return JSON.parse(buf.toString()).id;
    });
};

// Loads the current app from the API.
var getCurrentApp = () => {
  return getCurrentAppConfig()
    .then((appId) => {
      if (!appId) {
        throw new Error('No appId found.');
      }
      return callAPI('/apps/' + appId);
    })
    .catch(() => {
      throw new Error(`Warning! /${constants.CURRENT_APP_FILE} seems to be incorrect. Try running \`zapier config\` again.`);
    });
};

var checkCredentials = () => {
  return callAPI('/check');
};

var listApps = () => {
  return checkCredentials()
    .then(() => {
      return Promise.all([
        getCurrentApp(),
        callAPI('/apps')
      ]);
    })
    .then((values) => {
      var currentApp = values[0], data = values[1];
      return {
        app: currentApp,
        apps: data.objects.map((app) => {
          app.current = app.id === currentApp.id ? '✔' : '';
          return app;
        })
      };
    });
};

var listEndoint = (endpoint, key) => {
  return checkCredentials()
    .then(getCurrentApp)
    .then((app) => {
      return Promise.all([
        app,
        callAPI(`/apps/${app.id}/${endpoint}`)
      ]);
    })
    .then((values) => {
      var out = {
        app: values[0]
      };
      out[key || endpoint] = values[1].objects;
      return out;
    });
};

var listVersions = () => {
  return listEndoint('versions');
};

var listHistory = () => {
  return listEndoint('history');
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

// given an entry point, return a list of files that uses
// could probably be done better with module-deps...
var browserifyFiles = (entryPoint) => {
  var browserify = require('browserify');
  var through = require('through2');

  var cwd = process.cwd() + '/';
  var argv = {
    noParse: [ undefined ],
    extensions: [],
    ignoreTransform: [],
    entries: [ 'index.js' ],
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
  b.add(entryPoint);

  return new Promise((resolve, reject) => {
    b.on('error', reject);

    var output = [];
    b.pipeline.get('deps')
      .push(through.obj((row, enc, next) => {
        var filePath = row.file || row.id;
        output.push(filePath.replace(cwd, ''));
        next();
      })
      .on('end', () => {
        resolve(output);
      }));
    b.bundle();
  });
};

var makeZip = (dir, zipPath, src) => {
  var output = fs.createWriteStream(zipPath);
  var archive = archiver('zip');
  src = src || '**/*'; // could do browserify --list
  return new Promise((resolve, reject) => {
    output.on('close', () => {
      resolve(); // archive.pointer()
    });
    archive.on('error', reject);
    archive.pipe(output);
    archive.bulk([
      {
        expand: true,
        cwd: dir,
        src: src
      }
    ]);
    archive.finalize();
  });
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
    // tries to make a more reproducible zip build!
    .then(() => {
      // https://blog.pivotal.io/labs/labs/barriers-deterministic-reproducible-zip-files
      // https://reproducible-builds.org/tools/ or strip-nondeterminism
      return runCommand('find . -exec touch -t 201601010000 {} +', {cwd: tmpDir});
      // the next two break require('') if omitted :-/
      // if we browserify --list the next two can drop
      // .then(() => {
      //   // npm package.json has weird _args and _shasum style stuff
      //   return runCommand('find node_modules -name "package.json" -delete', {cwd: tmpDir});
      // })
      // .then(() => {
      //   // Makefile self edits
      //   return runCommand('find node_modules -name "Makefile" -delete', {cwd: tmpDir});
      // });
    })
    .then(() => {
      printDone();
      printStarting('  Building app definition (TODO!)');
      return Promise.resolve('TODO!');
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

var upload = (zipPath, defPath) => {
  zipPath = zipPath || constants.BUILD_PATH;
  defPath = defPath || constants.DEF_PATH;
  return getCurrentApp()
    .then((app) => {
      var definition = readFile(defPath)
        .then((buf) => {
          return JSON.parse(buf.toString());
        });
      var zipFile = readFile(zipPath)
        .then((buf) => {
          return buf.toString('base64');
        });
      return Promise.all([definition, zipFile, app]);
    })
    .then((values) => {
      var definition = values[0];
      var zipFile = values[1];
      var app = values[2];

      printStarting('  Uploading version ' + definition.version);
      return callAPI(`/apps/${app.id}/versions/${definition.version}`, {
        method: 'PUT',
        body: {
          platform_version: constants.PLATFORM_VERSION || definition.platformVersion,
          definition: definition,
          zip_file: zipFile
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
  printTable: printTable,
  prettyJSONstringify: prettyJSONstringify,
  printStarting: printStarting,
  printDone: printDone,
  getInput: getInput,
  readFile: readFile,
  writeFile: writeFile,
  copyDir: copyDir,
  ensureDir: ensureDir,
  readCredentials: readCredentials,
  removeDir: removeDir,
  runCommand: runCommand,
  callAPI: callAPI,
  getCurrentApp: getCurrentApp,
  checkCredentials: checkCredentials,
  listApps: listApps,
  listEndoint: listEndoint,
  listVersions: listVersions,
  listHistory: listHistory,
  listEnv: listEnv,
  browserifyFiles: browserifyFiles,
  build: build,
  upload: upload,
  buildAndUploadCurrentDir: buildAndUploadCurrentDir
};
