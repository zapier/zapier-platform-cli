const utils = require('../utils');

var historyCmd = () => {
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
historyCmd.help = 'Prints all recent history for your app.';
historyCmd.example = 'zapier history';

module.exports = historyCmd;
