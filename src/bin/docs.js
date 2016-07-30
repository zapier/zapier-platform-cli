#!/usr/bin/env node

const fs = require('fs');
const _ = require('lodash');

const commands = require('../commands');

const docs = _.map(commands, (command, name) => {
  return `\
## \`${name}\`

> \`${command.usage || command.example}\`

${command.help}

${command.docs}
`.trim();
}).join('\n\n\n');

fs.writeFileSync('./cli.md', docs);
