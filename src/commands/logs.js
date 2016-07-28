const utils = require('../utils');

var logsCmd = () => {
  return utils.listLogs(global.argOpts)
    .then((data) => {
      console.log(`The logs of your app "${data.app.title}" listed below.\n`);
      // http is the default
      var columns = [
        ['Status', 'response_status_code'],
        ['URL', 'request_url'],
        ['Querystring', 'request_params'],
        ['Version', 'app_v3_version'],
        ['Step', 'step'],
        // ['ID', 'id'],
        ['Timestamp', 'timestamp'],
      ];
      if (global.argOpts.console) {
        columns = [
          ['Log', 'message'],
          ['Version', 'app_v3_version'],
          ['Step', 'step'],
          // ['ID', 'id'],
          ['Timestamp', 'timestamp'],
        ];
      }

      if (global.argOpts.detailed) {
        columns.push(['Request Body', 'request_data']);
        columns.push(['Response Body', 'response_content']);
      }

      utils.printData(data.logs, columns, '', true);
    });
};
logsCmd.help = 'Prints recent logs. Can filter --{error|success} --{http|console} --user=you@person.com --detailed';
logsCmd.example = 'zapier logs --version=1.0.1';

module.exports = logsCmd;
