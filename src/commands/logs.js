const utils = require('../utils');

const availableShowOptions = {
  'request.body': ['Request Body', 'request_data'],
  'response.body': ['Response Body', 'response_content']
};

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

      if (global.argOpts.show) {
        const extraColumns = global.argOpts.show.split(',');
        extraColumns.forEach((extraColumn) => {
          if (availableShowOptions[extraColumn]) {
            columns.push(availableShowOptions[extraColumn]);
          }
        });
      }

      utils.printData(data.logs, columns, '', true);
    });
};
logsCmd.help = 'Prints recent logs. Can filter --{error|success} --{http|console} --user=you@person.com --show=response.body';
logsCmd.example = 'zapier logs --version=1.0.1';

module.exports = logsCmd;
