const utils = require('../utils');
const colors = require('colors/safe');

var logs = () => {
  return utils.listLogs(global.argOpts)
    .then((data) => {
      console.log(`The logs of your app "${data.app.title}" listed below.\n`);

      let columns;
      if (global.argOpts.console) {
        columns = [
          ['Log', 'message'],
          ['Version', 'app_v3_version'],
          ['Step', 'step'],
          // ['ID', 'id'],
          ['Timestamp', 'timestamp'],
        ];
      } else {
        // http is the default
        columns = [
          ['Status', 'response_status_code'],
          ['URL', 'request_url'],
          ['Querystring', 'request_params'],
          ['Version', 'app_v3_version'],
          ['Step', 'step'],
          // ['ID', 'id'],
          ['Timestamp', 'timestamp'],
        ];

        if (global.argOpts.detailed) {
          columns.push(['Request Body', 'request_data']);
          columns.push(['Response Body', 'response_content']);
        }
      }

      const ifEmpty = colors.grey('No logs found. Try adding some `z.request()`, `z.console.log()` and doing a `zapier push`!');
      utils.printData(data.logs, columns, ifEmpty, true);
    });
};
logs.help = 'Prints recent logs. See help for filter arguments.';
logs.example = 'zapier logs --version=1.0.1';
logs.docs = `\
Can filter --{error|success} --{http|console} --user=you@person.com --detailed --limit=5.

This is markdown documentation.

**Options**

* \`--help\` -- prints this help text, same as \`zapier help logs\`
* \`--debug\` -- print debug API calls and tracebacks

${'```'}bash
$ zapier logs
${'```'}
`;

module.exports = logs;
