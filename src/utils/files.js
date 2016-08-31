const _ = require('lodash');

const {promisifyAll} = require('./promisify');
const fse = promisifyAll(require('fs-extra'));

const fixHome = (dir) => {
  const home = process.env.HOME || process.env.USERPROFILE;
  return dir.replace('~', home);
};

const fileExistsSync = (fileName) => {
  try {
    fse.accessSync(fileName);
    return true;
  } catch (e) {
    return false;
  }
};

const validateFileExists = (fileName, errMsg) => {
  return fse.accessAsync(fileName)
    .catch(() => {
      let msg = `: File ${fileName} not found.`;
      if (errMsg) {
        msg += ` ${errMsg}`;
      }
      throw new Error(msg);
    });
};

// Returns a promise that reads a file and returns a buffer.
const readFile = (fileName, errMsg) => {
  return validateFileExists(fileName, errMsg)
    .then(() => fse.readFileAsync(fixHome(fileName)));
};

// Returns a promise that writes a file.
const writeFile = (fileName, data) => {
  if (!data) {
    throw new Error('No data provided');
  }
  return fse.writeFileAsync(fixHome(fileName), data);
};

// Returns a promise that copies a directory.
const copyDir = (src, dest, options) => {
  options = options || {};
  const defaultFilter = (dir) => {
    const isntPackage = dir.indexOf('node_modules') === -1;
    const isntBuild = dir.indexOf('.zip') === -1;
    return isntPackage && isntBuild;
  };
  options.filter = options.filter || defaultFilter;

  return fse.copyAsync(src, dest, options);
};

// Returns a promise that ensures a directory exists.
const ensureDir = (dir) => fse.ensureDirAsync(dir);

// Delete a directory.
const removeDir = (dir) => fse.removeAsync(dir);

// Returns true if directory is empty, else false.
// Rejects if directory does not exist.
const isEmptyDir = (dir) => fse.readdirAsync(dir).then(items => _.isEmpty(items));

module.exports = {
  writeFile,
  readFile,
  copyDir,
  ensureDir,
  removeDir,
  validateFileExists,
  fileExistsSync,
  isEmptyDir
};
