require('should');

const path = require('path');

const build = require('../../utils/build');

const entryPoint = require.resolve('../../../zapier.js');
const dir = path.dirname(entryPoint);

describe('build', () => {

  it('should list only required files', (done) => {
    build.browserifyFiles(entryPoint)
      .then((smartPaths) => {
        // check that only the two required lodash files are grabbed
        console.log(smartPaths);
        smartPaths
          .filter(filePath => filePath.indexOf('node_modules/lodash') === 0)
          .length.should.eql(2);
        smartPaths.should.containEql('node_modules/lodash/lodash.js');
        smartPaths.should.containEql('lib/commands/init.js');
        smartPaths.should.not.containEql('src/commands/init.js');
        smartPaths.should.not.containEql('README.md');
        done();
      })
      .catch(done);
  });

  it('should list all the files', (done) => {
    build.listFiles(dir)
      .then((dumbPaths) => {
        // check that way more than the the two required lodash files are grabbed
        dumbPaths
          .filter(filePath => filePath.indexOf('node_modules/lodash') === 0)
          .length.should.not.eql(2);
        dumbPaths.should.containEql('node_modules/lodash/lodash.js');
        dumbPaths.should.containEql('lib/commands/init.js');
        dumbPaths.should.containEql('src/commands/init.js');
        dumbPaths.should.containEql('README.md');
        done();
      })
      .catch(done);
  });

});
