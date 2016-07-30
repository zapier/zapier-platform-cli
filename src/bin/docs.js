#!/usr/bin/env node

const fs = require('fs');
const _ = require('lodash');

const commands = require('../commands');

const docs = _.map(commands, (command, name) => {
  return `\
## \`${name}\`

${command.help}

\`${command.usage || command.example}\`

${command.docs}
`.trim();
}).join('\n\n\n');

fs.writeFileSync('./cli.md', docs);
