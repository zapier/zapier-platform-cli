require('should');

const create = require('../../commands/create');
const {BASE_ENDPOINT, API_PATH} = require('../../constants');
const utils = require('../../utils');

const nock = require('nock');
const path = require('path');
const os = require('os');
const fse = require('fs-extra');

describe('create command', () => {
  const appDir = path.resolve(os.tmpdir(), 'test-app');

  beforeEach(() => {
    global.argOpts = {};
    fse.removeSync(appDir);
  });

  afterEach(() => {
    utils.clearSpinner();
  });

  it('should create a new app', (done) => {
    const zapierRc = {
      id: '123',
      key: 'testapp'
    };

    const scope = nock(BASE_ENDPOINT)
          .get(`${API_PATH}/check`)
          .reply(200, {})
          .post(`${API_PATH}/apps`, {
            title: 'Test App'
          })
          .reply(201, zapierRc)
          .get(`${API_PATH}/check`)
          .reply(200, {})
          .get(`${API_PATH}/apps/123`)
          .reply(200, zapierRc)
          .put(`${API_PATH}/apps/123/versions/1.2.50`) // TODO: don't hard code version
          .reply(200, {});

    create('Test App', appDir)
      .then(() => {
        // app should exist
        utils.fileExistsSync(path.resolve(appDir, 'index.js')).should.equal(true);

        // .zapierrc should exist and be correct
        const appRcFile = path.resolve(appDir, '.zapierapprc');
        console.log('appRcFile', appRcFile);
        utils.fileExistsSync(appRcFile).should.equal(true);
        const appRc = JSON.parse(fse.readFileSync(appRcFile, 'utf8'));
        appRc.should.eql(zapierRc);

        // .git should have been removed
        utils.fileExistsSync(path.resolve(appDir, '.git')).should.equal(false);

        // node modules should have been installed
        utils.fileExistsSync(path.resolve(appDir, 'node_modules')).should.equal(true);

        // app should have been built
        utils.fileExistsSync(path.resolve(appDir, 'build', 'build.zip')).should.equal(true);

        scope.done();
        done();
      }).catch(err => {
        utils.clearSpinner();
        console.error(err.message.substr(0, 500));
        scope.done();
        done(err);
      });
  });

});
