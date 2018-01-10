require('should');

const crypto = require('crypto');
const os = require('os');
const path = require('path');

const build = require('../../utils/build');

const fs = require('fs');
const fse = require('fs-extra');
const AdmZip = require('adm-zip');

const entryDir = fs.realpathSync(path.resolve(__dirname, '../../..'));
const entryPoint = path.resolve(__dirname, '../../../zapier.js');

describe('build', () => {
  it('should list only required files', done => {
    build
      .requiredFiles(entryDir, [entryPoint])
      .then(smartPaths => {
        // check that only the required lodash files are grabbed
        smartPaths
          .filter(filePath => filePath.indexOf('node_modules/lodash') === 0)
          .length.should.be.within(0, 2);
        smartPaths.should.containEql('node_modules/lodash/lodash.js');
        smartPaths.should.containEql('lib/commands/init.js');
        smartPaths.should.not.containEql('src/commands/init.js');
        smartPaths.should.not.containEql('README.md');
        done();
      })
      .catch(done);
  });

  it('should list all the files', done => {
    build
      .listFiles(entryDir)
      .then(dumbPaths => {
        // check that way more than the required lodash files are grabbed
        dumbPaths
          .filter(filePath => filePath.indexOf('node_modules/lodash') === 0)
          .length.should.be.within(800, 1200);
        dumbPaths.should.containEql('node_modules/lodash/lodash.js');
        dumbPaths.should.containEql('lib/commands/init.js');
        dumbPaths.should.containEql('src/commands/init.js');
        dumbPaths.should.containEql('README.md');
        done();
      })
      .catch(done);
  });

  it('should make a zip', (done) => {
    const osTmpDir = fse.realpathSync(os.tmpdir());
    const tmpProjectDir = path.join(osTmpDir, 'zapier-' + crypto.randomBytes(4).toString('hex'));
    const tmpZipPath = path.join(osTmpDir, 'zapier-' + crypto.randomBytes(4).toString('hex'), 'build.zip');
    const tmpUnzipPath = path.join(osTmpDir, 'zapier-' + crypto.randomBytes(4).toString('hex'));

    fse.outputFileSync(path.join(tmpProjectDir, 'zapierwrapper.js'), 'console.log(\'hello!\')');
    fse.outputFileSync(path.join(tmpProjectDir, 'index.js'), 'console.log(\'hello!\')');
    fse.ensureDirSync(path.dirname(tmpZipPath));

    global.argOpts = {};

    build.makeZip(tmpProjectDir, tmpZipPath)
      .then(() => {
        fs.statSync(tmpZipPath).size.should.be.above(0);

        const zip = new AdmZip(tmpZipPath);
        zip.extractAllTo(tmpUnzipPath, true);

        fs.statSync(path.join(tmpUnzipPath, 'zapierwrapper.js')).size.should.be.above(0);
        fs.statSync(path.join(tmpUnzipPath, 'index.js')).size.should.be.above(0);

        done();
      })
      .catch(done);
  });

});
