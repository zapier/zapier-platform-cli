#!/usr/bin/env node

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

var DEBUG = false;
var ENDPOINT = 'http://localhost:8000/api/platform/v3';

var STARTER_REPO = process.env.ZAPIER_STARTER_REPO || 'zapier/zapier-platform-example-app';
var CONFIG_LOCATION = process.env.ZAPIER_CONFIG_LOCATION || '~/.zapier-platform';
var CURRENT_APP_FILE = process.env.ZAPIER_CURRENT_APP_FILE || '.zapier-current-app';
// TODO: || is temp hack
var PLATFORM_VERSION = process.env.ZAPIER_PLATFORM_VERSION || '3.0.0';
var DEF_PATH = 'build/definition.json';
var BUILD_PATH = 'build/build.zip';

var ART = `\
                zzzzzzzz
      zzz       zzzzzzzz       zzz
    zzzzzzz     zzzzzzzz     zzzzzzz
   zzzzzzzzzz   zzzzzzzz   zzzzzzzzzz
      zzzzzzzzz zzzzzzzz zzzzzzzzz
        zzzzzzzzzzzzzzzzzzzzzzzz
          zzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzz          zzzzzzzzzzzzzzz
zzzzzzzzzzzzzzz          zzzzzzzzzzzzzzz
zzzzzzzzzzzzzzz          zzzzzzzzzzzzzzz
zzzzzzzzzzzzzzz          zzzzzzzzzzzzzzz
          zzzzzzzzzzzzzzzzzzzz
        zzzzzzzzzzzzzzzzzzzzzzzz
      zzzzzzzzz zzzzzzzz zzzzzzzzz
   zzzzzzzzzz   zzzzzzzz   zzzzzzzzzz
    zzzzzzz     zzzzzzzz     zzzzzzz
      zzz       zzzzzzzz       zzz
                zzzzzzzz`;


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
    readFile(CONFIG_LOCATION, 'Please run "zapier config".')
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

var makeZip = (dir, zipPath) => {
  var output = fs.createWriteStream(zipPath);
  var archive = archiver('zip');
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
        src: '**/*' // could do browserify --list
      }
    ]);
    archive.finalize();
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
        url: ENDPOINT + route,
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
      if (DEBUG) {
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
  return readFile(CURRENT_APP_FILE)
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
      throw new Error(`Warning! /${CURRENT_APP_FILE} seems to be incorrect. Try running \`zapier config\` again.`);
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

var build = (zipPath) => {
  var wdir = process.cwd();
  zipPath = zipPath || BUILD_PATH;
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
  zipPath = zipPath || BUILD_PATH;
  defPath = defPath || DEF_PATH;
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
          platform_version: PLATFORM_VERSION || definition.platformVersion,
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
  zipPath = zipPath || BUILD_PATH;
  return checkCredentials()
    .then(() => {
      return build(zipPath);
    })
    .then(() => {
      return upload(zipPath);
    });
};


// commands

var commands;

var helpCmd = () => {
  console.log(`
This Zapier command works off of two files:

 * ${CONFIG_LOCATION}      (home directory identifies the deploy key & user)
 * ./${CURRENT_APP_FILE}   (current directory identifies the app)

The config and create commands will help manage those files. All commands listed below.
`.trim());
  return Promise.resolve({})
    .then(() => {
      console.log('');
      var allCommands = Object.keys(commands).map((command) => {
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

var configCmd = () => {
  return getInput('What is your Deploy Key from https://zapier.com/platform/?\n\n')
    .then((answer) => {
      console.log('answer', answer);
      return writeFile(CONFIG_LOCATION, prettyJSONstringify({
        deployKey: answer
      }));
    })
    .then(checkCredentials)
    .then(() => {
      console.log('\nSaved key to ' + CONFIG_LOCATION);
    });
};
configCmd.docs = `Configure your ${CONFIG_LOCATION} with a deploy key for using the CLI.`;
configCmd.example = 'zapier config';

var createCmd = (title) => {
  return checkCredentials()
    .then(() => {
      console.log('Welcome to the Zapier Platform! :-D');
      console.log();
      console.log(ART);
      console.log();
      console.log(`Let's create your app "${title}"!`);
      console.log();
      printStarting('  Cloning starter app from ' + STARTER_REPO);
      // var cmd = 'git clone https://github.com/' + STARTER_REPO + '.git .';
      var cmd = `git clone git@github.com:${STARTER_REPO}.git .`;
      return runCommand(cmd);
    })
    .then(() => {
      return removeDir('.git');
    })
    .then(() => {
      printDone();
      printStarting('  Installing project dependencies');
      return runCommand('npm install');
    })
    .then(() => {
      printDone();
      printStarting(`  Creating a new app named "${title}"`);
      return callAPI('/apps', {
        method: 'POST',
        body: {
          title: title
        }
      });
    })
    .then((app) => {
      printDone();
      printStarting(`  Setting up ${CURRENT_APP_FILE} file`);
      return writeFile(CURRENT_APP_FILE, prettyJSONstringify({
        id: app.id,
        key: app.key
      }));
    })
    .then(() => {
      printDone();
      console.log('\nFinished! You can `zapier push` now to build & upload a version!');
    });
};
createCmd.docs = 'Creates a new app in your account.';
createCmd.example = 'zapier create "My Example App"';

var appsCmd = () => {
  return listApps()
    .then((data) => {
      console.log('All apps listed below.\n');
      printTable(data.apps, [
        ['Title', 'title'],
        ['Timestamp', 'date'],
        ['Unique Key', 'key'],
        ['Current', 'current'],
      ]);
      if (!data.apps.length) {
        console.log('\nTry adding an app with the `zapier create` command.');
      }
    });
};
appsCmd.docs = 'Lists all the apps in your account.';
appsCmd.example = 'zapier apps';

var buildCmd = (zipPath) => {
  console.log('Building project.\n');
  return build(zipPath)
    .then(() => {
      console.log(`\nBuild complete in ${BUILD_PATH}! Try the \`zapier upload\` command now.`);
    });
};
buildCmd.docs = 'Builds a deployable zip from the current directory.';
buildCmd.example = 'zapier build';

var versionsCmd = () => {
  return listVersions()
    .then((data) => {
      console.log(`All versions of your app "${data.app.title}" listed below.\n`);
      printTable(data.versions, [
        ['Version', 'version'],
        ['Timestamp', 'date'],
        ['Users', 'user_count'],
        ['Platform', 'platform_version'],
        ['Deployment', 'deployment'],
        ['Deprecation Date', 'deprecation_date'],
      ]);
      if (!data.versions.length) {
        console.log('\nTry adding an version with the `zapier upload` command.');
      }
    });
};
versionsCmd.docs = 'Lists all the versions of the current app.';
versionsCmd.example = 'zapier versions';

var pushCmd = () => {
  var zipPath = zipPath || BUILD_PATH;
  console.log('Preparing to build and upload a new version.\n');
  return buildAndUploadCurrentDir(zipPath)
    .then(() => {
      console.log('\nBuild and upload complete!');
    });
};
pushCmd.docs = 'Build and upload a new version of the current app - does not deploy.';
pushCmd.example = 'zapier push';

var uploadCmd = () => {
  var zipPath = zipPath || BUILD_PATH;
  console.log('Preparing to upload a new version.\n');
  return upload(zipPath)
    .then(() => {
      console.log(`\nUpload of ${BUILD_PATH} complete! Try \`zapier versions\` now!`);
    });
};
uploadCmd.docs = 'Upload the last build as a version.';
uploadCmd.example = 'zapier upload';

var deployCmd = (version) => {
  if (!version) {
    console.log('Error: No deploment/version selected...\n');
    return Promise.resolve();
  }

  return checkCredentials()
    .then(getCurrentApp)
    .then((app) => {
      console.log(`Preparing to deploy version ${version} your app "${app.title}".\n`);
      var url = `/apps/${app.id}/versions/${version}/deploy/production`;
      printStarting(`  Deploying ${version}`);
      return callAPI(url, {
        method: 'PUT',
        body: {}
      });
    })
    .then(() => {
      printDone();
      console.log(`  Deploy successful!\n`);
      console.log(`Optionally try the \`zapier migrate 1.0.0 1.0.1 [10%]\` command to put it into rotation.\n`);
    });
};
deployCmd.docs = 'Deploys a specific version to a production.';
deployCmd.example = 'zapier deploy 1.0.0';

var migrateCmd = (oldVersion, newVersion, optionalPercent) => {
  return Promise.resolve(`todo ${oldVersion} ${newVersion} ${optionalPercent}`);
};
migrateCmd.docs = 'Migrate users from one version to another.';
migrateCmd.example = 'zapier migrate 1.0.0 1.0.1 [10%]';

var historyCmd = () => {
  return listHistory()
    .then((data) => {
      console.log(`The history of your app "${data.app.title}" listed below.\n`);
      printTable(data.history, [
        ['Message', 'message'],
        ['Timestamp', 'date'],
      ]);
    });
};
historyCmd.docs = 'Prints all recent history for your app.';
historyCmd.example = 'zapier history';

var envCmd = (version, key, value) => {
  if (value !== undefined) {
    key = key.toUpperCase();
    return checkCredentials()
      .then(getCurrentApp)
      .then((app) => {
        var url = '/apps/' + app.id + '/versions/' + version + '/environment';
        console.log(`Preparing to set environment ${key} for your ${version} "${app.title}".\n`);
        printStarting(`  Setting ${key} to "${value}"`);
        return callAPI(url, {
          method: 'PUT',
          body: {
            key: key,
            value: value
          }
        });
      })
      .then(() => {
        printDone();
        console.log('  Environment updated!');
        console.log('');
        return envCmd(version);
      });
  }
  return listEnv(version)
    .then((data) => {
      console.log(`The env of your "${data.app.title}" listed below.\n`);
      printTable(data.environment, [
        ['Version', 'app_version'],
        ['Key', 'key'],
        ['Value', 'value'],
      ]);
      console.log(`\nTry setting an env with the \`${envCmd.example}\` command.`);
    });
};
envCmd.docs = 'Read and write environment variables.';
envCmd.example = 'zapier env 1.0.0 API_KEY 1234567890';


var deprecateCmd = (version, deprecation_date) => {
  if (!deprecation_date) {
    console.log('Error: No version or deprecation date - provide either a version like "1.0.0" and "2018-01-20"...\n');
    return Promise.resolve(true);
  }
  return checkCredentials()
    .then(getCurrentApp)
    .then((app) => {
      console.log(`Preparing to deprecate version ${version} your app "${app.title}".\n`);
      var url = '/apps/' + app.id + '/versions/' + version + '/deprecate';
      printStarting(`  Deprecating ${version}`);
      return callAPI(url, {
        method: 'PUT',
        body: {
          deprecation_date: deprecation_date
        }
      });
    })
    .then(() => {
      printDone();
      console.log('  Deprecation successful!\n');
      console.log(`We'll let users know that this version is no longer recommended.\n`);
    });
};
deprecateCmd.docs = 'Mark a non-production version of your app as deprecated by a certain date.';
deprecateCmd.example = 'zapier deprecate 1.0.0 2018-01-20';

commands = {
  help: helpCmd,
  config: configCmd,
  create: createCmd,
  apps: appsCmd,
  versions: versionsCmd,
  build: buildCmd, // debug only?
  upload: uploadCmd,
  push: pushCmd,
  deploy: deployCmd,
  migrate: migrateCmd,
  deprecate: deprecateCmd,
  history: historyCmd,
  env: envCmd,
};


// entry point

var main = (argv) => {
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
    .then(() => {
      console.log('');
    })
    .catch((err) => {
      console.log('\n');
      console.log('Error ' + err.message);
      console.log('\nFailed!');
      throw err;
    });
};

main(process.argv);
