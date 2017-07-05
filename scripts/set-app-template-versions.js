#!/usr/bin/env node

const _ = require('lodash');
const path = require('path');
const tmp = require('tmp');
const utils = require('../lib/utils');
const appTemplates = require('../lib/app-templates');
const versionStore = require('../lib/version-store');

const fse = require('fs-extra');
const semver = require('semver');
const yaml = require('yamljs');
const childProcess = utils.promisifyAll(require('child_process'));

const CLONE_URL_PREFIX = 'git@github.com:zapier/zapier-platform-example-app';

const newCoreVersion = process.argv[2];
if (!newCoreVersion) {
  console.error('Usage: npm run set-template-version [NEW_CORE_VERSION]');
  /*eslint no-process-exit: 0 */
  process.exit(1);
}

const newVersions = versionStore[semver.parse(newCoreVersion).major];
newVersions.coreVersion = newCoreVersion;

const exec = (cmd, cwd) => {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, {cwd}, err => {
      if (err) {
        console.error('error:', err);
        reject(err);
      }
      resolve();
    });
  });
};

const setVersion = (template, rootTmpDir) => {
  const repoName = `zapier-platform-example-app-${template}`;
  const repoDir = path.resolve(rootTmpDir, repoName);
  const cloneUrl = `${CLONE_URL_PREFIX}-${template}`;
  var cmd = `git clone ${cloneUrl}`;

  console.log(`Setting versions of node, npm, and zapier-platform-core to ${newVersions.nodeVersion}, ${newVersions.npmVersion}, and ${newVersions.coreVersion} respectively in ${template} app template.`);
  console.log(`cloning ${cloneUrl}\n`);

  return exec(cmd, rootTmpDir)
    .then(() => {
      const packageJsonFile = path.resolve(rootTmpDir, `${repoName}/package.json`);
      const packageJson = require(packageJsonFile);

      const nvmrcFile = path.resolve(rootTmpDir, `${repoName}/.nvmrc`);
      const nvmrcNodeVersion = fse.readFileSync(nvmrcFile, 'utf8').trim().substr(1); // strip off leading 'v'

      const travisYamlFile = path.resolve(rootTmpDir, `${repoName}/.travis.yml`);
      const travisYaml = yaml.load(travisYamlFile);

      const nodeVersion = semver.Comparator(newVersions.nodeVersion).semver.version
      if (packageJson.dependencies['zapier-platform-core'] === newVersions.coreVersion && packageJson.engines['node'] === newVersions.nodeVersion && packageJson.engines['npm'] === newVersions.npmVersion && nvmrcNodeVersion === nodeVersion && travisYaml.node_js[0] === nodeVersion) {
        return 'skip';
      }

      packageJson.dependencies['zapier-platform-core'] = newVersions.coreVersion;
      packageJson.engines['node'] = newVersions.nodeVersion;
      packageJson.engines['npm'] = newVersions.npmVersion;
      const json = JSON.stringify(packageJson, null, 2);
      fse.writeFileSync(packageJsonFile, json);

      fse.writeFileSync(nvmrcFile, `v${nodeVersion}`);

      travisYaml.node_js[0] = nodeVersion;
      fse.writeFileSync(travisYamlFile, yaml.stringify(travisYaml, null, 2));
    })
    .then(result => {
      if (result === 'skip') {
        return result;
      }

      cmd = `git commit package.json .nvmrc .travis.yml -m "update node, npm, and zapier-platform-core versions to ${newVersions.nodeVersion}, ${newVersions.npmVersion}, and ${newVersions.coreVersion} respectively."`;
      return exec(cmd, repoDir);
    })
    .then(result => {
      if (result === 'skip') {
        return result;
      }

      cmd = 'git push origin master';
      return exec(cmd, repoDir);
    })
    .then(result => {
      if (result === 'skip') {
        console.log(`${template} is already set to ${newVersions.nodeVersion}, ${newVersions.npmVersion}, and ${newVersions.coreVersion} for node, npm, and zapier-platform-core respectively, skipping`);
        return 'skip';
      }
      console.log(`Set node, npm, and zapier-platform-core versions to ${newVersions.nodeVersion}, ${newVersions.npmVersion}, and ${newVersions.coreVersion} respectively on app template ${template} successfully.`);
      return null;
    })
    .catch(err => {
      console.error(`Error setting node, npm, and zapier-platform-core versions for app template ${template}:`, err);
      return template;
    });
};

const rootTmpDir = tmp.tmpNameSync();
fse.removeSync(rootTmpDir);
fse.ensureDirSync(rootTmpDir);

const tasks = _.map(appTemplates, template => setVersion(template, rootTmpDir));

Promise.all(tasks)
  .then(results => {
    const failures = _.filter(results, result => result !== null && result !== 'skip');
    const skipped = _.filter(results, result => result === 'skip');
    const successCount = tasks.length - failures.length - skipped.length;

    if (failures.length) {
      console.error('failed to set node, npm, and zapier-platform-core versions on these templates:', failures.join(', '));
    }
    if (skipped.length) {
      console.log(`skipped ${skipped.length} templates because versions for node, npm, and zapier-platform-core were already set to ${newVersions.nodeVersion}, ${newVersions.npmVersion}, and ${newVersions.coreVersion} respectively}`);
    }
    if (successCount) {
      console.log(`Successfully updated versions in ${successCount} app templates`);
    }
  });
