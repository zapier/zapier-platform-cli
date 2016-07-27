const constants = require('../constants');

const crypto = require('crypto');
const os = require('os');
const path = require('path');

const _ = require('lodash');
const AdmZip = require('adm-zip');
const fse = require('fs-extra');

const {
  writeFile,
  readFile,
  copyDir,
  ensureDir,
  removeDir,
} = require('./files');

const {
  prettyJSONstringify,
  printStarting,
  printDone,
} = require('./display');

const {
  checkCredentials,
  upload,
} = require('./api');

const {
  runCommand,
  makePromise,
} = require('./misc');

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

const _appCommand = (dir, event) => {
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
      printStarting('Copying project to temp directory');
      return copyDir(wdir, tmpDir);
    })
    .then(() => {
      printDone();
      printStarting('Installing project dependencies');
      return runCommand('npm install --production', {cwd: tmpDir});
    })
    .then(() => {
      printDone();
      printStarting('Applying entry point file');
      // TODO: should this routine for include exist elsewhere?
      return readFile(`${tmpDir}/node_modules/${constants.PLATFORM_PACKAGE}/include/zapierwrapper.js`)
        .then(zapierWrapperBuf => writeFile(`${tmpDir}/zapierwrapper.js`, zapierWrapperBuf.toString()));
    })
    .then(() => {
      printDone();
      printStarting('Validating project');
      return _appCommand(tmpDir, {command: 'validate'});
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
      printStarting('Building app definition.json');
      return _appCommand(tmpDir, {command: 'definition'});
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
      printStarting('Zipping project and dependencies');
      return makeZip(tmpDir, wdir + '/' + zipPath);
    })
    .then(() => {
      printDone();
      printStarting('Cleaning up temp directory');
      return removeDir(tmpDir);
    })
    .then(() => {
      printDone();
      return zipPath;
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
  build,
  buildAndUploadCurrentDir,
};
