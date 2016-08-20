require('should');
const files = require('../../utils/files');

const path = require('path');
const os = require('os');

describe('files', () => {
  let tmpDir;

  beforeEach(done => {
    tmpDir = path.resolve(os.tmpdir(), 'zapier-platform-cli-files-test');
    files.ensureDir(tmpDir).then(() => done()).catch(done);
  });

  afterEach(done => {
    files.removeDir(tmpDir).then(() => done()).catch(done);
  });

  it('should read and write files', (done) => {
    const fileName = path.resolve(tmpDir, 'read-write-test.txt');
    const data = '123';

    files.writeFile(fileName, data)
      .then(() => files.readFile(fileName)
            .then(buf => {
              buf.toString().should.equal(data);
              done();
            })
           )
      .catch(done);
  });

  it('should copy a directory', (done) => {
    const srcDir = os.tmpdir();
    const srcFileName = path.resolve(srcDir, 'read-write-test.txt');
    const dstDir = path.resolve(srcDir, 'zapier-platform-cli-test-dest-dir');
    const dstFileName = path.resolve(dstDir, 'read-write-test.txt');
    const data = '123';

    files.writeFile(srcFileName, data)
      .then(files.copyDir(srcDir, dstDir))
      .then(files.readFile(dstFileName).then(buf => {
        buf.toString().should.equal(data);
        done();
      }))
      .catch(done);
  });

  describe('validateFileExists', () => {

    it('should not reject when file exists', (done) => {
      files.validateFileExists(__filename).then(() => done())
      .catch(done);
    });

    it('should reject with custom message when file does not exist', (done) => {
      files.validateFileExists('./i-do-not-exist.txt', 'Oh noes.')
        .then(() => {
          done('expected an error');
        })
        .catch(err => {
          err.message.should.eql(': File ./i-do-not-exist.txt not found. Oh noes.');
          done();
        });
    });

  });

});
