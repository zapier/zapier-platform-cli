const _ = require('lodash');

/*
  Turn node style async methods with callbacks into methods that return promises.
  Poor man's version of Bluebird's promisify module. If we start using Bluebird,
  ditch this module.
*/

const promisify = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      const cb = (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      };
      fn(...args.concat(cb));
    });
  };
};

const promisifyAll = (module) => {
  return _.reduce(module, (result, method, name) => {
    if (!name.match(/Sync$/)) {
      result[`${name}Async`] = promisify(method);
    }
    result[name] = method;
    return result;
  }, {});
};

module.exports = {
  promisify,
  promisifyAll
};
