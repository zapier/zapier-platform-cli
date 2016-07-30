const utils = require('../utils');

var deprecate = (version, deprecation_date) => {
  if (!deprecation_date) {
    console.log('Error: No version or deprecation date - provide either a version like "1.0.0" and "2018-01-20"...\n');
    return Promise.resolve(true);
  }
  return utils.checkCredentials()
    .then(utils.getLinkedApp)
    .then((app) => {
      console.log(`Preparing to deprecate version ${version} your app "${app.title}".\n`);
      var url = '/apps/' + app.id + '/versions/' + version + '/deprecate';
      utils.printStarting(`Deprecating ${version}`);
      return utils.callAPI(url, {
        method: 'PUT',
        body: {
          deprecation_date: deprecation_date
        }
      });
    })
    .then(() => {
      utils.printDone();
      console.log('  Deprecation successful!\n');
      console.log('We\'ll let users know that this version is no longer recommended.');
    });
};
deprecate.help = 'Mark a non-production version of your app as deprecated by a certain date.';
deprecate.example = 'zapier deprecate 1.0.0 2018-01-20';
deprecate.docs = `\
### TODO!

This is markdown documentation.
`;

module.exports = deprecate;
