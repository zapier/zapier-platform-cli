#!/usr/bin/env node

const _ = require('lodash');
const path = require('path');

const allCommands = require('../lib/commands/index');
const convertUtils = require('../lib/utils/convert');
const renderTemplate = convertUtils.renderTemplate;

const commands = _.filter(allCommands, cmd => !cmd.hide && cmd.name !== 'access');

const clean = s => s ? s.replace(/[`']/g, '') : '';

const optsList = _.map(commands, cmd => {
  const opts = _.map(cmd.argOptsSpec, (spec, opt) => `"--${opt}:'${clean(spec.help)}'"`);
  return `local ${cmd.name}Opts=(${opts.join(' ')})`;
});

const commandsList = _.map(commands, cmd => `"${cmd.name}:'${clean(cmd.help)}'"`);

const templateFile = path.resolve(__dirname, '_zapier.template');

const optsCases = _.map(commands, cmd => {
  return `        ${cmd.name})
               _describe 'options' ${cmd.name}Opts
               ;;`;
});

const context = {
  OPTS_LIST: optsList.join('\n    '),
  OPTS_CASE: optsCases.join('\n'),
  COMMANDS: commandsList.join(' ')
};

renderTemplate(templateFile, context).then(s => {
  console.log(s);
});
