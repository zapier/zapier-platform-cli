const _ = require('lodash');

const {globalArgOpts} = require('./args');

const sq = (s) => String(s || '').indexOf(' ') === -1 ? s : `"${s}"`;

const argOptsFragment = (argOpts) => {
  return _.map(argOpts, (spec, name) => {
    let val = spec.example || spec.default || 'value';
    val = (spec.choices && spec.choices.length) ? `{${spec.choices.map(String).join(',')}}` : val;
    val = spec.flag ? '' : `=${sq(val)}`;
    let def = spec.default ? `, default is \`${spec.default}\`` : '';
    return `* \`--${name}${val}\` -- ${spec.help}${def}`;
  }).join('\n');
};

const defaultArgOptsFragment = () => {
  return argOptsFragment(globalArgOpts);
};

module.exports = {
  argOptsFragment,
  defaultArgOptsFragment
};
