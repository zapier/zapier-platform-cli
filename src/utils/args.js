const _ = require('lodash');

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
      errors.push(`Missing required positional argument ${i + 1} "${spec.name}"`);
    }

    restAfter = i;
    if (spec.rest) {
      restAfter = 1000;
    }
  });

  _.forEach(args, (arg, i) => {
    if (i > restAfter) {
      errors.push(`Unexpected positional argument ${i + 1} "${arg}"`);
    }
  });

  _.forEach(argOptsSpec, (spec, name) => {
    let arg = argOpts[name];
    if (spec.required && !arg) {
      errors.push(`Missing required keyword argument --${name}="${spec.example || 'value'}"`);
    }
  });

  return errors;
};

module.exports = {
  argParse,
  enforceArgSpec
};
