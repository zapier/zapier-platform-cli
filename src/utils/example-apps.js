const fetch = require('node-fetch');
const path = require('path');
const os = require('os');

const AdmZip = require('adm-zip');

const {writeFile, copyDir} = require('./files');

const downloadAndUnzipTo = (key, destDir) => {
  const fragment = `zapier-platform-example-app-${key}`;
  const folderInZip = `${fragment}-master`;
  const url = `https://codeload.github.com/zapier/${fragment}/zip/master`;

  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, 'zapier-template.zip');

  return fetch(url)
    .then((res) => res.buffer())
    .then((buffer) => writeFile(tempFilePath, buffer))
    .then(() => {
      const zip = new AdmZip(tempFilePath);
      zip.extractAllTo(tempDir, true);
      return path.join(tempDir, folderInZip);
    })
    .then((currPath) => {
      return copyDir(currPath, destDir);
    });
};

module.exports = {
  downloadAndUnzipTo
};
