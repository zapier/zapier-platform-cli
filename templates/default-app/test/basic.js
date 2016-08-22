require('should');

const zapier = require('@zapier/zapier-platform-core');
const runApp = zapier.exposeAppTestable(require('../index'));

describe('app', () => {

  describe('validation', () => {
    it('should be a valid app', (done) => {
      runApp({command: 'validate'})
        .then((resp) => {
          resp.results.should.eql([]);
          done();
        })
        .catch(done);
    });
  });

});
