const _ = require('lodash');
const AWS = require('aws-sdk');
const unzip = require('unzip');

const {promisifyAll, promisifySome} = require('./promisify');
const {promiseDoWhile} = require('./misc');
const fse = promisifyAll(require('fs-extra'));

const BUCKET = 'zapier-platform-example-apps';

const s3 = promisifySome(new AWS.S3({params: {Bucket: BUCKET}}),
                         ['createBucket', 'listObjectsV2', 'upload', 'deleteObject', 'getObject']);

const list = () => {
  let results = [];
  let nextContinuationToken;

  const action = () => {
    return s3.listObjectsV2Async({ContinuationToken: nextContinuationToken})
      .then(data => {
        nextContinuationToken = data.NextContinuationToken;
        //const keys = _.map(data.Contents, 'Key');
        results = results.concat(data.Contents);
        return data;
      });
  };

  const stop = data => !data.IsTruncated;

  return promiseDoWhile(action, stop)
    .then(() => results);
};

const upload = (key, zipFile) => {
  return fse.readFileAsync(zipFile)
    .then(buf => s3.uploadAsync({Key: key, Body: buf}));
};

const remove = (key) => {
  return s3.deleteObjectAsync({Key: key});
};

const download = (key, destDir) => {
  return new Promise((resolve, reject) => {
    const readStream = s3.getObject({Key: key}).createReadStream();
    const unzipStream = unzip.Extract({path: destDir});

    readStream.pipe(unzipStream);

    readStream.on('error', reject);
    unzipStream.on('close', resolve);
  });
};

const ensureBucket = (methods) => {
  return _.reduce(methods, (results, method, methodName) => {
    results[methodName] = (...args) => (
      s3.createBucketAsync().then(() => method(...args))
    );
    return results;
  }, {});
};

const exports = {
  list,
  upload,
  download,
  remove
};

module.exports = ensureBucket(exports);
