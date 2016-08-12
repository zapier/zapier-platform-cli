const _ = require('lodash');

const {globalArgOptsSpec} = require('./args');

const sq = (s) => String(s || '').indexOf(' ') === -1 ? s : `"${s}"`;

// Make a markdown list for args.
const argsFragment = (argsSpec) => {
  return _.map(argsSpec, (spec) => {
    let val = spec.example || spec.default || 'value';
    val = (spec.choices && spec.choices.length) ? `{${spec.choices.map(String).join(',')}}` : val;
    let def = spec.default ? `, default is \`${spec.default}\`` : '';
    return `* \`${sq(val)}\` -- ${spec.required ? '**required**' : '_optional_'}, ${spec.help || ''}${def}`;
  }).join('\n');
};

// Make a markdown list for args opts/keywords.
const argOptsFragment = (argOptsSpec) => {
  return _.map(argOptsSpec, (spec, name) => {
    let val = spec.example || spec.default || 'value';
    val = (spec.choices && spec.choices.length) ? `{${spec.choices.map(String).join(',')}}` : val;
    val = spec.flag ? '' : `=${sq(val)}`;
    let def = spec.default ? `, default is \`${spec.default}\`` : '';
    return `* \`--${name}${val}\` -- ${spec.required ? '**required**' : '_optional_'}, ${spec.help || ''}${def}`;
  }).join('\n');
};

const defaultArgOptsFragment = () => argOptsFragment(globalArgOptsSpec);

module.exports = {
  argsFragment,
  argOptsFragment,
  defaultArgOptsFragment
};
