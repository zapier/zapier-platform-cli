const readline = require('readline');

const Table = require('cli-table2');
const colors = require('colors/safe');
const _ = require('lodash');


const rewriteLabels = (rows, columnDefs) => {
  return rows.map((row) => {
    const consumptionRow = {};
    columnDefs.forEach((columnDef) => {
      const [label, key] = columnDef;
      let val = row[key];
      consumptionRow[label] = val;
    });
    return consumptionRow;
  });
};

// Wraps the cli-table2 library. Rows is an array of objects, columnDefs
// an ordered sub-array [[label, key, (optional_default)], ...].
const makeTable = (rows, columnDefs) => {
  const table = new Table({
    head: columnDefs.map(([label]) => label),
    style: {
      compact: true,
      head: ['bold']
    }
  });

  rows.forEach((row) => {
    const consumptionRow = [];
    columnDefs.forEach((columnDef) => {
      const [label, key, _default] = columnDef;
      const val = _.get(row, key || label, _default || '');
      consumptionRow.push(String(val).trim());
    });
    table.push(consumptionRow);
  });

  return table.toString().trim();
};

const printData = (rows, columnDefs, ifEmptyMessage) => {
  if (rows && !rows.length) {
    console.log(ifEmptyMessage);
  } else if (global.argOpts.json) {
    console.log(prettyJSONstringify(rewriteLabels(rows, columnDefs)));
  } else if (global.argOpts['json-raw']) {
    console.log(prettyJSONstringify(rows));
  } else {
    console.log(makeTable(rows, columnDefs));
  }
};

const prettyJSONstringify = (obj) => {
  return JSON.stringify(obj, null, '  ');
};

let spinner;
let currentIter = 0;
const spinSpeed = 150;
const spinTransitions = [
  '   ',
  '.  ',
  '.. ',
  '...',
];
// const spinTransitions = [
//   ' \\',
//   ' |',
//   ' /',
//   ' -',
// ];

const clearSpinner = () => {
  process.stdout.write('\x1b[?25h'); // set cursor to write...
  clearInterval(spinner);
};

const writeNextSpinnerTick = (final = false) => {
  readline.moveCursor(process.stdout, -spinTransitions[currentIter].length, 0);
  currentIter++;
  if (currentIter >= spinTransitions.length) { currentIter = 0; }
  process.stdout.write(final ? spinTransitions[spinTransitions.length - 1] : spinTransitions[currentIter]);
};

const printStarting = (msg) => {
  process.stdout.write('  ' + msg + spinTransitions[currentIter]);
  clearSpinner();
  process.stdout.write('\x1b[?25l'); // set cursor to black...
  spinner = setInterval(() => {
    writeNextSpinnerTick();
  }, spinSpeed);
};

const printDone = (success = true) => {
  if (!spinner) { return; }
  clearSpinner();
  writeNextSpinnerTick(true);
  console.log(success ? colors.green(' done!') : colors.red(' fail!'));
};

// Get input from a user.
const getInput = (question) => {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

module.exports = {
  makeTable,
  printData,
  prettyJSONstringify,
  clearSpinner,
  printStarting,
  printDone,
  getInput,
};
