#!/usr/bin/env node

var crypto = require('crypto');
var cp = require('child_process');
var fs = require('fs');
var os = require('os');
var readline = require('readline');
var path = require('path');

var archiver = require('archiver');
require('es6-promise').polyfill();
var fse = require('fs-extra');
var fetch = require('node-fetch');
var Table = require('easy-table');

var DEBUG = false;
var ENDPOINT = 'http://localhost:8000/api/platform/v3';

var STARTER_REPO = process.env.ZAPIER_STARTER_REPO || 'zapier/platform-example-app';
var CONFIG_LOCATION = process.env.ZAPIER_CONFIG_LOCATION || '~/.zapier-platform';
var CURRENT_APP_FILE = process.env.ZAPIER_CURRENT_APP_FILE || '.zapier-current-app';
// TODO: || is temp hack
var PLATFORM_VERSION = process.env.ZAPIER_PLATFORM_VERSION || '3.0.0';
var DEF_PATH = 'build/definition.json';
var BUILD_PATH = 'build/build.zip';

var ART = '\
                zzzzzzzz                \n\
      zzz       zzzzzzzz       zzz      \n\
    zzzzzzz     zzzzzzzz     zzzzzzz    \n\
   zzzzzzzzzz   zzzzzzzz   zzzzzzzzzz   \n\
      zzzzzzzzz zzzzzzzz zzzzzzzzz      \n\
        zzzzzzzzzzzzzzzzzzzzzzzz        \n\
          zzzzzzzzzzzzzzzzzzzz          \n\
zzzzzzzzzzzzzzz          zzzzzzzzzzzzzzz\n\
zzzzzzzzzzzzzzz          zzzzzzzzzzzzzzz\n\
zzzzzzzzzzzzzzz          zzzzzzzzzzzzzzz\n\
zzzzzzzzzzzzzzz          zzzzzzzzzzzzzzz\n\
          zzzzzzzzzzzzzzzzzzzz          \n\
        zzzzzzzzzzzzzzzzzzzzzzzz        \n\
      zzzzzzzzz zzzzzzzz zzzzzzzzz      \n\
   zzzzzzzzzz   zzzzzzzz   zzzzzzzzzz   \n\
    zzzzzzz     zzzzzzzz     zzzzzzz    \n\
      zzz       zzzzzzzz       zzz      \n\
                zzzzzzzz                ';


// Wraps the easy-table library. Rows is an array of objects,
// columnDefs an ordered sub-array [[label, key], ...].
var printTable = function(rows, columnDefs) {
  var t = new Table();

  rows.forEach(function(row) {
    columnDefs.forEach(function(columnDef) {
      var label = columnDef[0], key = columnDef[1];
      t.cell(label, row[key]);
    });
    t.newRow();
  });

  console.log(t.toString().trim());
};

var prettyJSONstringify = function(obj) {
  return JSON.stringify(obj, null, '  ');
};

var printStarting = function(msg) {
  process.stdout.write(msg + '... ');
};

var printDone = function() {
  console.log('done!');
};

var fixHome = function(dir) {
  var home = process.env.HOME || process.env.USERPROFILE;
  return dir.replace('~', home);
};

// Get input from a user.
var getInput = function(question) {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(function(resolve) {
    rl.question(question, function(answer) {
      rl.close();
      resolve(answer);
    });
  });
};

// Returns a promise that reads a file and returns a buffer.
var readFile = function(fileName) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fixHome(fileName), function(err, buf) {
      if (err) {
        reject(err);
      } else {
        resolve(buf);
      }
    });
  });
};

// Returns a promise that writes a file.
var writeFile = function(fileName, data) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(fixHome(fileName), data, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Returns a promise that copies a directory.
var copyDir = function(src, dest, options) {
  options = options || {};
  options.filter = options.filter || function(dir) {
    var isntPackage = dir.indexOf('node_modules') === -1;
    var isntBuild = dir.indexOf('.zip') === -1;
    return isntPackage && isntBuild;
  };
  return new Promise(function(resolve, reject) {
    fse.copy(src, dest, options, function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

// Returns a promise that ensures a directory exists.
var ensureDir = function(dir) {
  return new Promise(function(resolve, reject) {
    fse.ensureDir(dir, function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

// Reads the JSON file at ~/.zapier-platform (CONFIG_LOCATION).
var readCredentials = function(credentials) {
  return Promise.resolve(
    credentials ||
    readFile(CONFIG_LOCATION)
      .then(function(buf) {
        return JSON.parse(buf.toString());
      })
  );
};

// Delete a directory.
var removeDir = function(dir) {
  return new Promise(function(resolve, reject) {
    fse.remove(dir, function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

// Run a command with a promise.
var runCommand = function(command, options) {
  options = options || {};
  return new Promise(function(resolve, reject) {
    cp.exec(command, options, function(err, stdout, stderr) {
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

var makeZip = function(dir, zipPath) {
  var output = fs.createWriteStream(zipPath);
  var archive = archiver('zip');
  return new Promise(function(resolve, reject) {
    output.on('close', function() {
      resolve(); // archive.pointer()
    });
    archive.on('error', reject);
    archive.pipe(output);
    archive.bulk([
      {
        expand: true,
        cwd: dir,
        src: '**/*' // could do browserify --list
      }
    ]);
    archive.finalize();
  });
};

// Calls the underlying platform REST API with proper authentication.
var callAPI = function(route, options) {
  options = options || {};
  return readCredentials()
    .then(function(credentials) {
      var _options = {
        method: options.method || 'GET',
        body: options.body ? JSON.stringify(options.body) : null,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          'X-Deploy-Key': credentials.deployKey
        }
      };
      return fetch(ENDPOINT + route, _options);
    })
    .then(function(res) {
      return Promise.all([
        res,
        res.text()
      ]);
    })
    .then(function(values) {
      var res = values[0], text = values[1];
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
var getCurrentAppConfig = function() {
  return readFile(CURRENT_APP_FILE)
    .then(function(buf) {
      return JSON.parse(buf.toString()).id;
    });
};

// Loads the current app from the API.
var getCurrentApp = function() {
  return getCurrentAppConfig()
    .then(function(appId) {
      return callAPI('/apps/' + appId);
    });
};

var checkCredentials = function() {
  return callAPI('/check');
};

var listApps = function() {
  return checkCredentials()
    .then(function() {
      return Promise.all([
        getCurrentApp(),
        callAPI('/apps')
      ]);
    })
    .then(function(values) {
      var currentApp = values[0], data = values[1];
      return {
        app: currentApp,
        apps: data.objects.map(function(app) {
          app.current = app.id === currentApp.id ? '✔' : '';
          return app;
        })
      };
    });
};

var listEndoint = function(endpoint) {
  return checkCredentials()
    .then(getCurrentApp)
    .then(function(app) {
      return Promise.all([
        app,
        callAPI('/apps/' + app.id + '/' + endpoint)
      ]);
    })
    .then(function(values) {
      var out = {
        app: values[0]
      };
      out[endpoint] = values[1].objects;
      return out;
    });
};

var listVersions = function() {
  return listEndoint('versions');
};

var listDeployments = function() {
  return listEndoint('deployments');
};

var listHistory = function() {
  return listEndoint('history');
};

var build = function(zipPath) {
  var wdir = process.cwd();
  zipPath = zipPath || BUILD_PATH;
  var tmpDir = path.join(os.tmpdir(), 'zapier-' + crypto.randomBytes(4).toString('hex'));
  return ensureDir(tmpDir)
    .then(function() {
      printStarting('  Copying project to temp directory');
      return copyDir(wdir, tmpDir);
    })
    .then(function() {
      printDone();
      printStarting('  Installing project dependencies');
      return runCommand('npm install --production', {cwd: tmpDir});
    })
    // tries to make a more reproducible zip build!
    .then(function() {
      // https://blog.pivotal.io/labs/labs/barriers-deterministic-reproducible-zip-files
      // https://reproducible-builds.org/tools/ or strip-nondeterminism
      return runCommand('find . -exec touch -t 201601010000 {} +', {cwd: tmpDir});
      // the next two break require('') if omitted :-/
      // if we browserify --list the next two can drop
      // .then(function() {
      //   // npm package.json has weird _args and _shasum style stuff
      //   return runCommand('find node_modules -name "package.json" -delete', {cwd: tmpDir});
      // })
      // .then(function() {
      //   // Makefile self edits
      //   return runCommand('find node_modules -name "Makefile" -delete', {cwd: tmpDir});
      // });
    })
    .then(function() {
      printDone();
      printStarting('  Building app definition (TODO!)');
      return Promise.resolve('TODO!');
    })
    .then(function() {
      printDone();
      printStarting('  Zipping project and dependencies');
      return makeZip(tmpDir, wdir + '/' + zipPath);
    })
    .then(function() {
      printDone();
      printStarting('  Cleaning up temp directory');
      return removeDir(tmpDir);
    })
    .then(function() {
      printDone();
      return zipPath;
    });
};

var upload = function(zipPath, defPath) {
  zipPath = zipPath || BUILD_PATH;
  defPath = defPath || DEF_PATH;
  return getCurrentApp()
    .then(function(app) {
      var definition = readFile(defPath)
        .then(function(buf) {
          return JSON.parse(buf.toString());
        });
      var zipFile = readFile(zipPath)
        .then(function(buf) {
          return buf.toString('base64');
        });
      return Promise.all([definition, zipFile, app]);
    })
    .then(function(values) {
      var definition = values[0];
      var zipFile = values[1];
      var app = values[2];

      printStarting('  Uploading version ' + definition.version);
      return callAPI('/apps/' + app.id + '/versions/' + definition.version, {
        method: 'PUT',
        body: {
          platform_version: PLATFORM_VERSION || definition.platformVersion,
          definition: definition,
          zip_file: zipFile
        }
      });
    })
    .then(function() {
      printDone();
    });
};

var buildAndUploadCurrentDir = function(zipPath) {
  zipPath = zipPath || BUILD_PATH;
  return checkCredentials()
    .then(function() {
      return build(zipPath);
    })
    .then(function() {
      return upload(zipPath);
    });
};


// commands

var commands;

var helpCmd = function() {
  return Promise.resolve({})
    .then(function() {
      console.log('All commands listed below.\n');
      var allCommands = Object.keys(commands).map(function(command) {
        return {
          name: command,
          docs: commands[command].docs,
          example: commands[command].example
        };
      });
      printTable(allCommands, [
        ['Command', 'name'],
        ['Example', 'example'],
        ['Documentation', 'docs'],
      ]);
    });
};
helpCmd.docs = 'Lists all the commands you can use.';
helpCmd.example = 'zapier help';

var configCmd = function() {
  return getInput('What is your Deploy Key from https://zapier.com/platform/?\n\n')
    .then(function(answer) {
      return writeFile(CONFIG_LOCATION, prettyJSONstringify({
        deployKey: answer
      }));
    })
    .then(checkCredentials)
    .then(function() {
      console.log('\nSaved key to ' + CONFIG_LOCATION);
    });
};
configCmd.docs = 'Configure your ' + CONFIG_LOCATION + ' with a deploy key for using the CLI.';
configCmd.example = 'zapier config';

var createCmd = function(title) {
  return checkCredentials()
    .then(function() {
      console.log('Welcome to the Zapier Platform! :-D');
      console.log();
      console.log(ART);
      console.log();
      console.log('Let\'s create your app "' + title + '"!');
      console.log();
      printStarting('  Cloning starter app from ' + STARTER_REPO);
      // var cmd = 'git clone https://github.com/' + STARTER_REPO + '.git .';
      var cmd = 'git clone git@github.com:' + STARTER_REPO + '.git .';
      return runCommand(cmd);
    })
    .then(function() {
      return removeDir('.git');
    })
    .then(function() {
      printDone();
      printStarting('  Installing project dependencies');
      return runCommand('npm install');
    })
    .then(function() {
      printDone();
      printStarting('  Creating a new app named "' + title + '"');
      return callAPI('/apps', {
        method: 'POST',
        body: {
          title: title
        }
      });
    })
    .then(function(app) {
      printDone();
      printStarting('  Setting up ' + CURRENT_APP_FILE + ' file');
      return writeFile(CURRENT_APP_FILE, prettyJSONstringify({
        id: app.id,
        key: app.key
      }));
    })
    .then(function() {
      printDone();
      console.log('\nFinished! You can `zapier push` now - or make tweaks!');
    });
};
createCmd.docs = 'Creates a new app in your account.';
createCmd.example = 'zapier create "My Example App"';

var appsCmd = function() {
  return listApps()
    .then(function(data) {
      console.log('All apps listed below.\n');
      printTable(data.apps, [
        ['Title', 'title'],
        ['Date', 'date'],
        ['Unique Key', 'key'],
        ['Current', 'current'],
      ]);
    });
};
appsCmd.docs = 'Lists all the apps in your account.';
appsCmd.example = 'zapier apps';

var buildCmd = function(zipPath) {
  console.log('Building project.\n');
  return build(zipPath);
};
buildCmd.docs = 'Builds a deployable zip from the current directory.';
buildCmd.example = 'zapier build';

var versionsCmd = function() {
  return listVersions()
    .then(function(data) {
      console.log('All versions of your app "' + data.app.title + '" listed below.\n');
      printTable(data.versions, [
        ['Version', 'version'],
        ['Date', 'date'],
        ['Package SHA1', 'sha1'],
        ['Platform', 'platform_version'],
        ['Deployments', 'deployments'],
      ]);
    });
};
versionsCmd.docs = 'Lists all the versions of the current app.';
versionsCmd.example = 'zapier versions';

var pushCmd = function() {
  var zipPath = zipPath || BUILD_PATH;
  console.log('Preparing to build and upload a new version.\n');
  return buildAndUploadCurrentDir(zipPath)
    .then(function() {
      console.log('\nBuild and upload complete!');
    });
};
pushCmd.docs = 'Build and upload a new version of the current app - does not deploy.';
pushCmd.example = 'zapier push';

var uploadCmd = function() {
  var zipPath = zipPath || BUILD_PATH;
  console.log('Preparing to upload a new version.\n');
  return upload(zipPath)
    .then(function() {
      console.log('\nUpload complete!');
    });
};
uploadCmd.docs = 'Just upload the last build - does not deploy.';
uploadCmd.example = 'zapier upload';

var deploymentsCmd = function() {
  return listDeployments()
    .then(function(data) {
      console.log('All deployment slots of your app "' + data.app.title + '" listed below.\n');
      printTable(data.deployments, [
        ['Deployment', 'deployment'],
        ['Version', 'version'],
        ['Last Change', 'last_update'],
      ]);
    });
};
deploymentsCmd.docs = 'Lists all the deployments of the current app.';
deploymentsCmd.example = 'zapier deployments';

var deployCmd = function(deployment, version) {
  if (!deployment || !version) {
    console.log('Error: No deploment/version selected...\n');
    return deploymentsCmd();
  }

  return checkCredentials()
    .then(getCurrentApp)
    .then(function(app) {
      console.log('Preparing to deploy version ' + version + ' your app "' + app.title + '" in ' + deployment + '.\n');
      var url = '/apps/' + app.id + '/deployments/' + deployment;
      printStarting('  Deploying ' + version + ' to ' + deployment);
      return callAPI(url, {
        method: 'PUT',
        body: {
          version: version
        }
      });
    })
    .then(function() {
      printDone();
      console.log('  Deploy successful! :-D');
      console.log('');
      return deploymentsCmd();
    });
};
deployCmd.docs = 'Deploys a specific version to a specific deployment.';
deployCmd.example = 'zapier deploy staging 1.0.0';

var historyCmd = function() {
  return listHistory()
    .then(function(data) {
      console.log('The history of your app "' + data.app.title + '" listed below.\n');
      printTable(data.history, [
        ['Message', 'message'],
        ['Date', 'date'],
      ]);
    });
};
historyCmd.docs = 'Prints all recent history for your app.';
historyCmd.example = 'zapier history';

commands = {
  help: helpCmd,
  config: configCmd,
  create: createCmd,
  build: buildCmd, // debug only?
  apps: appsCmd,
  push: pushCmd,
  upload: uploadCmd, // debug only?
  versions: versionsCmd,
  deploy: deployCmd,
  deployments: deploymentsCmd,
  history: historyCmd,
};


// entry point

var main = function(argv) {
  if (DEBUG) {
    console.log('running in:', process.cwd());
    console.log('raw argv:', argv);
    console.log('\n--------------------------------------------------\n\n');
  }

  argv = argv.slice(2);
  var command = argv[0];
  var args = argv.slice(1);

  var commandFunc = commands[command];
  if (!commandFunc) {
    console.log('Usage: zapier COMMAND [command-specific-options]\n');
    commandFunc = commands.help;
  }

  commandFunc.apply(commands, args)
    .then(function() {
      console.log('');
    })
    .catch(function(err) {
      console.log('\n');
      console.log('Error ' + err.message);
      console.log('\nFailed!');
      throw err;
    });
};

main(process.argv);
