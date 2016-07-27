const utils = require('../utils');


var envCmd = (version, key, value) => {
  if (value !== undefined) {
    key = key.toUpperCase();
    return utils.checkCredentials()
      .then(utils.getLinkedApp)
      .then((app) => {
        var url = '/apps/' + app.id + '/versions/' + version + '/environment';
        console.log(`Preparing to set environment ${key} for your ${version} "${app.title}".\n`);
        utils.printStarting(`Setting ${key} to "${value}"`);
        return utils.callAPI(url, {
          method: 'PUT',
          body: {
            key: key,
            value: value
          }
        });
      })
      .then(() => {
        utils.printDone();
        console.log('');
        console.log('Environment updated! Try viewing it with `zapier env`.');
        return;
      });
  }
  return utils.listEnv(version)
    .then((data) => {
      console.log(`The env of your "${data.app.title}" listed below.\n`);
      utils.printData(data.environment, [
        ['Version', 'app_version'],
        ['Key', 'key'],
        ['Value', 'value'],
      ]);
      console.log(`\nTry setting an env with the \`${envCmd.example}\` command.`);
    });
};
envCmd.help = 'Read and write environment variables.';
envCmd.example = 'zapier env 1.0.0 API_KEY 1234567890';


module.exports = envCmd;
