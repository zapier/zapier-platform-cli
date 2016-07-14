var constants = require('./constants');
var utils = require('./utils');

var commands;


var helpCmd = () => {
  console.log(`
This Zapier command works off of two files:

 * ${constants.AUTH_LOCATION}      (home directory identifies the deploy key & user)
 * ./${constants.CURRENT_APP_FILE}   (current directory identifies the app)

The \`zapier auth\` and \`zapier create\`/\`zapier link\` commands will help manage those files. All commands listed below.
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
      utils.printTable(allCommands, [
        ['Command', 'name'],
        ['Example', 'example'],
        ['Documentation', 'docs'],
      ]);
    });
};
helpCmd.docs = 'Lists all the commands you can use.';
helpCmd.example = 'zapier help';


var authCmd = () => {
  var checks = [
    utils.readCredentials()
      .then(() => true)
      .catch(() => false),
    utils.checkCredentials()
      .then(() => true)
      .catch(() => false)
  ];
  return Promise.all(checks)
    .then(([credentialsPresent, credentialsGood]) => {
      if (!credentialsPresent) {
        console.log(`Your ${constants.AUTH_LOCATION} has not been set up yet.\n`);
      } else if (!credentialsGood) {
        console.log(`Your ${constants.AUTH_LOCATION} looks like it has invalid credentials.\n`);
      } else {
        console.log(`Your ${constants.AUTH_LOCATION} looks valid. You may update it now though.\n`);
      }
      return utils.getInput('What is your Deploy Key from https://zapier.com/platform/? (Ctl-C to cancel)\n\n');
    })
    .then((answer) => {
      return utils.writeFile(constants.AUTH_LOCATION, utils.prettyJSONstringify({
        deployKey: answer
      }));
    })
    .then(utils.checkCredentials)
    .then(() => {
      console.log('');
      console.log(`Your deploy key has been saved to ${constants.AUTH_LOCATION}. Now try \`zapier create\` or \`zapier link\`.`);
    });
};
authCmd.docs = `Configure your ${constants.AUTH_LOCATION} with a deploy key for using the CLI.`;
authCmd.example = 'zapier auth';


var createCmd = (title) => {
  return utils.checkCredentials()
    .then(() => {
      console.log('Welcome to the Zapier Platform! :-D');
      console.log();
      console.log(constants.ART);
      console.log();
      console.log(`Let's create your app "${title}"!`);
      console.log();

      let repo = constants.STARTER_REPO;
      if (global.argOpts.style) {
        repo = `${constants.STARTER_REPO}-${global.argOpts.style}`;
      }

      utils.printStarting('  Cloning starter app from ' + repo);
      // var cmd = 'git clone https://github.com/' + STARTER_REPO + '.git .';
      var cmd = `git clone git@github.com:${repo}.git .`;
      return utils.runCommand(cmd);
    })
    .then(() => {
      return utils.removeDir('.git');
    })
    .then(() => {
      utils.printDone();
      utils.printStarting('  Installing project dependencies');
      return utils.runCommand('npm install');
    })
    .then(() => {
      utils.printDone();
      utils.printStarting(`  Creating a new app named "${title}"`);
      return utils.callAPI('/apps', {
        method: 'POST',
        body: {
          title: title
        }
      });
    })
    .then((app) => {
      utils.printDone();
      utils.printStarting(`  Setting up ${constants.CURRENT_APP_FILE} file`);
      return utils.writeLinkedAppConfig(app);
    })
    .then(() => {
      utils.printDone();
      console.log('\nFinished! You can `zapier push` now to build & upload a version!');
    });
};
createCmd.docs = 'Creates a new app in your account.';
createCmd.example = 'zapier create "My Example App"';


var linkCmd = () => {
  var appMap = {};

  return utils.listApps()
    .then((data) => {
      console.log('Which app would you like to link the current directory to?\n');
      var apps = data.apps.map((app, index) => {
        app.number = index + 1;
        appMap[app.number] = app;
        return app;
      });
      utils.printTable(apps, [
        ['Number', 'number'],
        ['Title', 'title'],
        ['Unique Key', 'key'],
        ['Timestamp', 'date'],
        ['Linked', 'linked'],
      ]);
      console.log('     ...or type any title to create new app!\n');
      return utils.getInput('Which app number do you want to link? You also may type a new app title to create one. (Ctl-C to cancel)\n\n');
    })
    .then((answer) => {
      console.log('');
      if (answer.toLowerCase() === 'no' || answer.toLowerCase() === 'cancel') {
        throw new Error('Cancelled link operation.');
      } else if (appMap[answer]) {
        utils.printStarting(`  Selecting existing app ${appMap[answer].title}`);
        return appMap[answer];
      } else {
        var title = answer;
        utils.printStarting(`  Creating a new app named "${title}"`);
        return utils.callAPI('/apps', {
          method: 'POST',
          body: {
            title: title
          }
        });
      }
    })
    .then((app) => {
      utils.printDone();
      utils.printStarting(`  Setting up ${constants.CURRENT_APP_FILE} file`);
      return utils.writeLinkedAppConfig(app);
    })
    .then(() => {
      utils.printDone();
      console.log('\nFinished! You can `zapier push` now to build & upload a version!');
    });
};
linkCmd.docs = 'Link the current directory to an app in your account.';
linkCmd.example = 'zapier link';


var appsCmd = () => {
  return utils.listApps()
    .then((data) => {
      console.log('All apps listed below.\n');
      utils.printTable(data.apps, [
        ['Title', 'title'],
        ['Unique Key', 'key'],
        ['Timestamp', 'date'],
        ['Linked', 'linked'],
      ]);
      if (!data.apps.length) {
        console.log('\nTry adding an app with the `zapier create` command.');
      } else {
        console.log('\nTry linking a different app with the `zapier link` command.');
      }
    });
};
appsCmd.docs = 'Lists all the apps in your account.';
appsCmd.example = 'zapier apps';


var validateCmd = () => {
  console.log('Validating project locally.\n');
  return Promise.resolve()
    .then(() => {
      var appRaw = require(`${process.cwd()}/index`);
      var zapier = require(`${process.cwd()}/node_modules/${constants.PLATFORM_PACKAGE}`);
      var handler = zapier.exposeAppHandler(appRaw);
      var promise = utils.makePromise();
      handler({command: 'validate'}, {}, promise.callback);
      return promise;
    })
    .then(response => response.results)
    .then((errors) => {
      utils.printTable(errors, [
        ['Property', 'property'],
        ['Message', 'message'],
      ]);
      return errors;
    })
    .then((errors) => {
      if (errors.length) {
        console.log(`\nMake any changes to your project and rerun this command.`);
      } else {
        console.log(`\nThis project looks good!`);
      }
    });
};
validateCmd.docs = 'Validates the current project.';
validateCmd.example = 'zapier validate';

var buildCmd = (zipPath) => {
  console.log('Building project.\n');
  return utils.build(zipPath)
    .then(() => {
      console.log(`\nBuild complete in ${constants.BUILD_PATH}! Try the \`zapier upload\` command now.`);
    });
};
buildCmd.docs = 'Builds a deployable zip from the current directory.';
buildCmd.example = 'zapier build';


var versionsCmd = () => {
  return utils.listVersions()
    .then((data) => {
      console.log(`All versions of your app "${data.app.title}" listed below.\n`);
      utils.printTable(data.versions, [
        ['Version', 'version'],
        ['Platform', 'platform_version'],
        ['Users', 'user_count'],
        ['Deployment', 'deployment'],
        ['Deprecation Date', 'deprecation_date'],
        ['Timestamp', 'date'],
      ]);
      if (!data.versions.length) {
        console.log('\nTry adding an version with the `zapier push` command.');
      }
    });
};
versionsCmd.docs = 'Lists all the versions of the current app.';
versionsCmd.example = 'zapier versions';


var pushCmd = () => {
  var zipPath = zipPath || constants.BUILD_PATH;
  console.log('Preparing to build and upload a new version.\n');
  return utils.buildAndUploadCurrentDir(zipPath)
    .then(() => {
      console.log('\nBuild and upload complete! Try loading the Zapier editor now.');
    });
};
pushCmd.docs = 'Build and upload a new version of the current app - does not deploy.';
pushCmd.example = 'zapier push';


var uploadCmd = () => {
  var zipPath = zipPath || constants.BUILD_PATH;
  console.log('Preparing to upload a new version.\n');
  return utils.upload(zipPath)
    .then(() => {
      console.log(`\nUpload of ${constants.BUILD_PATH} complete! Try \`zapier versions\` now!`);
    });
};
uploadCmd.docs = 'Upload the last build as a version.';
uploadCmd.example = 'zapier upload';


var deployCmd = (version) => {
  if (!version) {
    console.log('Error: No deploment/version selected...\n');
    return Promise.resolve();
  }

  return utils.checkCredentials()
    .then(utils.getLinkedApp)
    .then((app) => {
      console.log(`Preparing to deploy version ${version} your app "${app.title}".\n`);
      var url = `/apps/${app.id}/versions/${version}/deploy/production`;
      utils.printStarting(`  Deploying ${version}`);
      return utils.callAPI(url, {
        method: 'PUT',
        body: {}
      });
    })
    .then(() => {
      utils.printDone();
      console.log(`  Deploy successful!\n`);
      console.log(`Optionally try the \`zapier migrate 1.0.0 1.0.1 [10%]\` command to put it into rotation.`);
    });
};
deployCmd.docs = 'Deploys a specific version to a production.';
deployCmd.example = 'zapier deploy 1.0.0';


var migrateCmd = (oldVersion, newVersion, optionalPercent) => {
  return Promise.resolve(`todo ${oldVersion} ${newVersion} ${optionalPercent}`);
};
migrateCmd.docs = 'Migrate users from one version to another.';
migrateCmd.example = 'zapier migrate 1.0.0 1.0.1 [10%]';


var deprecateCmd = (version, deprecation_date) => {
  if (!deprecation_date) {
    console.log('Error: No version or deprecation date - provide either a version like "1.0.0" and "2018-01-20"...\n');
    return Promise.resolve(true);
  }
  return utils.checkCredentials()
    .then(utils.getLinkedApp)
    .then((app) => {
      console.log(`Preparing to deprecate version ${version} your app "${app.title}".\n`);
      var url = '/apps/' + app.id + '/versions/' + version + '/deprecate';
      utils.printStarting(`  Deprecating ${version}`);
      return utils.callAPI(url, {
        method: 'PUT',
        body: {
          deprecation_date: deprecation_date
        }
      });
    })
    .then(() => {
      utils.printDone();
      console.log('  Deprecation successful!\n');
      console.log(`We'll let users know that this version is no longer recommended.`);
    });
};
deprecateCmd.docs = 'Mark a non-production version of your app as deprecated by a certain date.';
deprecateCmd.example = 'zapier deprecate 1.0.0 2018-01-20';

var historyCmd = () => {
  return utils.listHistory()
    .then((data) => {
      console.log(`The history of your app "${data.app.title}" listed below.\n`);
      utils.printTable(data.history, [
        ['What', 'action'],
        ['Message', 'message'],
        ['Who', 'customuser'],
        ['Timestamp', 'date'],
      ]);
    });
};
historyCmd.docs = 'Prints all recent history for your app.';
historyCmd.example = 'zapier history';

var logsCmd = () => {
  return utils.listLogs(global.argOpts)
    .then((data) => {
      console.log(`The logs of your app "${data.app.title}" listed below.\n`);
      // http is the default
      var columns = [
        ['Status', 'response_status_code'],
        ['URL', 'request_url'],
        ['Querystring', 'request_params'],
        ['Version', 'app_v3_version'],
        ['ID', 'id'],
        ['Timestamp', 'timestamp'],
      ];
      if (global.argOpts.console) {
        columns = [
          ['Log', 'message'],
          ['Version', 'app_v3_version'],
          ['ID', 'id'],
          ['Timestamp', 'timestamp'],
        ];
      }
      utils.printTable(data.logs, columns);
    });
};
logsCmd.docs = 'Prints recent logs. Can filter --{error|success} --{http|console} --user=you@person.com';
logsCmd.example = 'zapier logs --version=1.0.1';


var envCmd = (version, key, value) => {
  if (value !== undefined) {
    key = key.toUpperCase();
    return utils.checkCredentials()
      .then(utils.getLinkedApp)
      .then((app) => {
        var url = '/apps/' + app.id + '/versions/' + version + '/environment';
        console.log(`Preparing to set environment ${key} for your ${version} "${app.title}".\n`);
        utils.printStarting(`  Setting ${key} to "${value}"`);
        return utils.callAPI(url, {
          method: 'PUT',
          body: {
            key: key,
            value: value
          }
        });
      })
      .then(() => {
        utils.printDone();
        console.log('  Environment updated!');
        console.log('');
        return envCmd(version);
      });
  }
  return utils.listEnv(version)
    .then((data) => {
      console.log(`The env of your "${data.app.title}" listed below.\n`);
      utils.printTable(data.environment, [
        ['Version', 'app_version'],
        ['Key', 'key'],
        ['Value', 'value'],
      ]);
      console.log(`\nTry setting an env with the \`${envCmd.example}\` command.`);
    });
};
envCmd.docs = 'Read and write environment variables.';
envCmd.example = 'zapier env 1.0.0 API_KEY 1234567890';


module.exports = commands = {
  help: helpCmd,
  auth: authCmd,
  create: createCmd,
  link: linkCmd,
  apps: appsCmd,
  versions: versionsCmd,
  validate: validateCmd,
  build: buildCmd, // debug only?
  upload: uploadCmd,
  push: pushCmd,
  deploy: deployCmd,
  migrate: migrateCmd,
  deprecate: deprecateCmd,
  history: historyCmd,
  logs: logsCmd,
  env: envCmd,
};
