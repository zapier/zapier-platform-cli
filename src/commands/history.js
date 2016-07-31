const utils = require('../utils');

var history = () => {
  return utils.listHistory()
    .then((data) => {
      console.log(`The history of your app "${data.app.title}" listed below.\n`);
      utils.printData(data.history, [
        ['What', 'action'],
        ['Message', 'message'],
        ['Who', 'customuser'],
        ['Timestamp', 'date'],
      ]);
    });
};
history.help = 'Prints all recent history for your app.';
history.example = 'zapier history';
history.docs = `\
**TODO!**

This is markdown documentation.
`;

module.exports = history;
