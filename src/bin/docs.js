#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('lodash');

const litdoc = require('litdoc');

const commands = require('../commands');

// Takes all the cmd.docs and puts them into a big md file.
const generateCliMarkdown = () => {
  return _.map(commands, (command, name) => {
    return `\
## ${name}

${command.help}

**Usage:** \`${command.usage || command.example}\`

${command.docs}
`.trim();
  }).join('\n\n\n');
};

// Writes out a big markdown file for the cli.
const writeCliDocs = ({ markdownPath = './docs/build/cli.md'} = {}) => {
  const docs = generateCliMarkdown();

  fs.writeFileSync(markdownPath, `\
# Zapier CLI Reference

These are the generated docs for all Zapier platform CLI commands.

You can install the CLI with \`npm\`.

${'```'}bash
$ npm install -g @zapier/zapier-platform-cli
${'```'}

# Commands

${docs}
`);
};


writeCliDocs();

litdoc({
  title: 'Zapier Platform CLI Documentation',
  markdownPath: path.join(__dirname, '../../docs/README.md'),
  outputPath: path.join(__dirname, '../../docs/build/index.html')
});

// TODO: toc(../../docs/README.md) to ../../README.md

litdoc({
  title: 'Zapier Platform CLI Reference',
  markdownPath: path.join(__dirname, '../../docs/build/cli.md'),
  outputPath: path.join(__dirname, '../../docs/build/cli.html')
});
