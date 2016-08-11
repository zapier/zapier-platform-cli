const fs = require('fs'); // TODO: fse is a drop in replacement for fs, don't need both
const fse = require('fs-extra');

const fixHome = (dir) => {
  var home = process.env.HOME || process.env.USERPROFILE;
  return dir.replace('~', home);
};

const fileExistsSync = (path) => {
  try {
    fs.accessSync(path);
    return true;
  } catch (e) {
    return false;
  }
};

// Returns a promise that reads a file and returns a buffer.
const readFile = (fileName, errMsg) => {
  return new Promise((resolve, reject) => {
    // TODO: fs.exists is deprecated, use fs.access or fs.stat
    fs.exists(fixHome(fileName), (exists) => {
      if (!exists) {
        var msg = `: File ${fileName} not found.`;
        if (errMsg) {
          msg += ` ${errMsg}`;
        }
        reject(new Error(msg));
      } else {
        fs.readFile(fixHome(fileName), (err, buf) => {
          if (err) {
            reject(err);
          } else {
            resolve(buf);
          }
        });
      }
    });
  });
};

// Returns a promise that writes a file.
const writeFile = (fileName, data) => {
  return new Promise((resolve, reject) => {
    if (!data) {
      reject(Error('No data provided'));
    } else {
      fs.writeFile(fixHome(fileName), data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }
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


module.exports = {
  writeFile,
  readFile,
  copyDir,
  ensureDir,
  removeDir,
  fileExistsSync
};
