const _ = require('lodash');

const globalArgOpts = {
  format: {help: 'display format', choices: ['plain', 'json', 'row', 'table']},
  help: {help: 'prints this help text', flag: true},
  debug: {help: 'print debug API calls and tracebacks', flag: true},
};

const argParse = (argv) => {
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

const enforceArgSpec = (fullSpec, args, argOpts) => {
  const argSpec = fullSpec.argSpec || [];
  const argOptsSpec = fullSpec.argOptsSpec || {};

  const errors = [];
  let restAfter = -1;

  const _argLookback = {};

  // Make sure the spec has the provided args.
  _.forEach(argSpec, (spec, i) => {
    let arg = args[i];

    _argLookback[spec.name] = arg;

    let missingCurrent = spec.required && !arg;
    let missingLookback = (
      !arg && // is absent (but that could be fine)!
      (spec.requiredWith || []).length && // has required friends!
      _.every(spec.requiredWith, (name) => _argLookback[name]) // friends are missing!
    );
    if (missingCurrent || missingLookback) {
      errors.push(`Missing required positional argument ${i + 1}/${spec.name}`);
    }
    if (arg && spec.choices && spec.choices.length && spec.choices.indexOf(arg) === -1) {
      let choices = spec.choices.map(s => JSON.stringify(s)).join(', ');
      errors.push(`Unexpected positional argument ${i + 1} "${arg}", must be one of ${choices}`);
    }

    restAfter = i;
    if (spec.rest) {
      restAfter = 1000;
    }
  });

  // Make sure any leftover provided args are expected.
  _.forEach(args, (arg, i) => {
    if (i > restAfter) {
      errors.push(`Unexpected positional argument ${i + 1} "${arg}"`);
    }
  });

  // Make sure the spec has the provided args opts/keywords.
  _.forEach(argOptsSpec, (spec, name) => {
    let arg = argOpts[name];

    if (spec.flag && arg && arg !== true) {
      errors.push(`Unexpected keyword argument with value --${name}`);
      return;
    }

    if (spec.required && !arg) {
      errors.push(`Missing required keyword argument --${name}="${arg || spec.example || 'value'}"`);
    }

    if (arg && spec.choices && spec.choices.length && spec.choices.indexOf(arg) === -1) {
      let choices = spec.choices.map(s => JSON.stringify(s)).join(', ');
      errors.push(`Unexpected keyword argument --${name}="${arg}", must be one of ${choices}`);
    }
  });

  // Make sure any leftover provided args opts/keywords are expected.
  _.forEach(argOpts, (arg, name) => {
    if (!argOptsSpec[name]) {
      if (arg === true) {
        errors.push(`Unexpected keyword argument --${name}`);
      } else {
        errors.push(`Unexpected keyword argument --${name}="${arg}"`);
      }
    }
  });

  return errors;
};

module.exports = {
  globalArgOpts,
  argParse,
  enforceArgSpec
};
