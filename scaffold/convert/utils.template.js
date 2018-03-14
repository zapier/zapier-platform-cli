// Utility functions

const _ = require('lodash');

// Does string replacement ala WB, using bundle and a potential result object
const replaceVars = (templateString, bundle, result) => {
  const options = {
    interpolate: /{{([\s\S]+?)}}/g
  };
  const values = _.extend({}, bundle.authData, bundle.inputData, result);
  return _.template(templateString, options)(values);
};

// Check if an object is a Promise
const isPromise = obj => {
  return typeof obj === 'object' && typeof obj.then === 'function';
};

// Explicitly run App.beforeRequest middlewares in the app code. Only necessary
// for WB scripting methods that send HTTP requests themselves, such as
// KEY_poll, KEY_search, KEY_write, KEY_read_resource, KEY_custom_action_fields
// and KEY_custom_search_fields.
const runBeforeMiddlewares = (request, z, bundle) => {
  const app = require('./');

  const befores = app.beforeRequest ? app.beforeRequest : [];
  return befores.reduce((prevResult, before) => {
    if (!isPromise(prevResult)) {
      prevResult = Promise.resolve(prevResult);
    }
    return prevResult.then(newRequest => {
      return before(newRequest, z, bundle);
    });
  }, request);
};

module.exports = {
  replaceVars,
  runBeforeMiddlewares
};
