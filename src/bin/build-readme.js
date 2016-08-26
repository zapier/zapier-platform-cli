const fs = require('fs-extra');
const path = require('path');

const maybeInsertSnippet = (line) => {
  const m = line.match(/\[insert-file:(.+)\]/);
  if (m) {
    const file = path.resolve(__dirname, '../..', m[1]);
    return fs.readFileSync(file, 'utf8');
  }
  return line;
};

// Inserts code snippets from README-source.md into README.md
const buildReadme = () => {
  const readmeSrc = path.resolve(__dirname, '../../README-source.md');
  const readmeDst = path.resolve(__dirname, '../../README.md');

  const lines = fs.readFileSync(readmeSrc, 'utf8').split('\n');
  const newLines = lines.map(maybeInsertSnippet).join('\n');
  fs.writeFileSync(readmeDst, newLines);
};

module.exports = buildReadme;
