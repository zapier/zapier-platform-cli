const utils = require('../utils');
const colors = require('colors/safe');

var logs = (context) => {
  return utils.listLogs(global.argOpts)
    .then((data) => {
      context.line(`The logs of your app "${data.app.title}" listed below.\n`);

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

      const ifEmpty = colors.grey('No logs found. Try adding some `z.request()`, `z.context.line()` and doing a `zapier push`!');
      utils.printData(data.logs, columns, ifEmpty, true);
    });
};
logs.argSpec = [];
logs.argOptsSpec = {
  version: {},
  error: {},
  success: {},
  console: {},
  http: {},
  detailed: {},
  user: {},
  limit: {},
};
logs.help = 'Prints recent logs. See help for filter arguments.';
logs.example = 'zapier logs';
logs.docs = `\
Get the logs that are automatically collected during the running of your app. Either explicitly during \`z.context.line()\`, automatically via \`z.request()\` or any sort of traceback or error.

> Does not collect or list the errors found locally during \`npm test\`.

**Options**

* \`--version=1.0.0\` -- display only this version's logs, default \`null\`
* \`--{error|success}\` -- display only error or success logs, default \`'success'\`
* \`--{console|http}\` -- display only console or http logs, default \`'http'\`
* \`--detailed\` -- show detailed logs (like http body), default \`false\`
* \`--user=user@example.com\` -- display only this users logs, default \`null\`
* \`--limit=5\` -- display only console or http logs, default \`50\`
${utils.defaultOptionsDocFragment({cmd: 'logs'})}

${'```'}bash
$ zapier logs
# The logs of your app "Example" listed below.
# 
# ┌────────────────────────────────────────────────────────┐
# │ = 1 =                                                  │
# │     Status      │ 200                                  │
# │     URL         │ http://httpbin.org/get               │
# │     Querystring │ hello=world                          │
# │     Version     │ 1.0.0                                │
# │     Step        │ 99c16565-1547-4b16-bcb5-45189d9d8afa │
# │     Timestamp   │ 2016-01-01T23:04:36-05:00            │
# └─────────────────┴──────────────────────────────────────┘

$ zapier logs --http --detailed --format=plain
# The logs of your app "Example" listed below.
# 
# == Status
# 200
# == URL
# http://httpbin.org/get
# == Querystring
# hello=world
# == Version
# 1.0.0
# == Step
# 99c16565-1547-4b16-bcb5-45189d9d8afa
# == Timestamp
# 2016-08-03T23:04:36-05:00
# == Request Body
# undefined
# == Response Body
# {
#   "args": {
#     "hello": "world"
#   },
#   "headers": {
#     "Accept": "*/*",
#     "Accept-Encoding": "gzip,deflate",
#     "Host": "httpbin.org",
#     "User-Agent": "Zapier"
#   },
#   "origin": "123.123.123.123",
#   "url": "http://httpbin.org/get?hello=world"
# }

$ zapier logs --console
# The logs of your app "Example" listed below.
# 
# ┌──────────────────────────────────────────────────────┐
# │ = 1 =                                                │
# │     Log       │ console says hello world!            │
# │     Version   │ 1.0.0                                │
# │     Step      │ 99c16565-1547-4b16-bcb5-45189d9d8afa │
# │     Timestamp │ 2016-01-01T23:04:36-05:00            │
# └───────────────┴──────────────────────────────────────┘
${'```'}
`;

module.exports = logs;
