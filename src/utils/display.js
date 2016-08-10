const readline = require('readline');

const Table = require('cli-table2');
const colors = require('colors/safe');
const stringLength = require('string-length');
const _ = require('lodash');

const markdownLog = (str) => {
  // turn markdown into something with styles and stuff
  // https://blog.mariusschulz.com/content/images/sublime_markdown_with_syntax_highlighting.png
  console.log(str);
};

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
  const options = {
    head: columnDefs.map(([label]) => label),
    style: {
      compact: true,
      head: ['bold']
    }
  };
  const table = new Table(options);

  rows.forEach((row) => {
    const consumptionRow = [];
    columnDefs.forEach((columnDef) => {
      const [label, key, _default] = columnDef;
      const val = _.get(row, key || label, _default || '');
      consumptionRow.push(String(val).trim());
    });
    table.push(consumptionRow);
  });

  const strTable = table.toString().trim();

  const widestRow = strTable.split('\n').reduce((coll, row) => {
    if (stringLength(row) > coll) {
      return stringLength(row);
    } else {
      return coll;
    }
  }, 0);

  if (widestRow > process.stdout.columns) {
    return makeRowBasedTable(rows, columnDefs);
  }

  return strTable;
};

// Similar to makeTable, but prints the column headings in the left-hand column
// and the values in the right-hand column, in rows
const makeRowBasedTable = (rows, columnDefs) => {
  const table = new Table({
    style: {
      compact: true
    }
  });

  const maxLabelLength = _.reduce(columnDefs, (maxLength, columnDef) => {
    if (columnDef[0] && stringLength(columnDef[0]) > maxLength) {
      return stringLength(columnDef[0]);
    }
    return maxLength;
  }, 1);
  const widthForValue = process.stdout.columns - maxLabelLength - 15; // The last bit accounts for some padding and borders

  rows.forEach((row, index) => {
    table.push([{colSpan: 2, content: colors.grey(`= ${index + 1} =`)}]);

    columnDefs.forEach((columnDef) => {
      const consumptionRow = {};
      const [label, key, _default] = columnDef;
      var val = String(_.get(row, key || label, _default || '')).trim();

      if (stringLength(val) > widthForValue) {
        try {
          val = prettyJSONstringify(JSON.parse(val));
        } catch(err) {
          // Wasn't JSON, so splice in newlines so that word wraping works properly
          var rest = val;
          val = '';
          while (stringLength(rest) > 0) {
            val += rest.slice(0, widthForValue) + '\n';
            rest = rest.slice(widthForValue);
          }
        }
      }
      consumptionRow['    ' + colors.bold(label)] = val.trim();
      table.push(consumptionRow);
    });

    if (index < rows.length - 1) {
      table.push([{colSpan: 2, content: '  '}]);
    }
  });

  return table.toString().trim();
};

const printData = (rows, columnDefs, ifEmptyMessage = '', useRowBasedTable = false) => {
  if (rows && !rows.length) {
    console.log(ifEmptyMessage);
  } else if (global.argOpts.json) {
    console.log(prettyJSONstringify(rewriteLabels(rows, columnDefs)));
  } else if (global.argOpts['json-raw']) {
    console.log(prettyJSONstringify(rows));
  } else if (useRowBasedTable || global.argOpts['row-based']) {
    console.log(makeRowBasedTable(rows, columnDefs));
  } else {
    console.log(makeTable(rows, columnDefs));
  }
};

const prettyJSONstringify = (obj) => {
  return JSON.stringify(obj, null, '  ');
};

let spinner;
let currentIter = 0;
const spinSpeed = 80;
// const spinTransitions = [
//   '   ',
//   '.  ',
//   '.. ',
//   '...',
// ];
// const spinTransitions = [
//   ' \\',
//   ' |',
//   ' /',
//   ' -',
// ];
const spinTransitions = [
  ' ⠃',
  ' ⠉',
  ' ⠘',
  ' ⠰',
  ' ⠤',
  ' ⠆',
];
const finalTransition = ' -'; // spinTransitions[0];

const clearSpinner = () => {
  process.stdout.write('\x1b[?25h'); // set cursor to white...
  clearInterval(spinner);
};

const writeNextSpinnerTick = (final = false) => {
  readline.moveCursor(process.stdout, -spinTransitions[currentIter].length, 0);
  currentIter++;
  if (currentIter >= spinTransitions.length) { currentIter = 0; }
  process.stdout.write(final ? finalTransition : spinTransitions[currentIter]);
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
  markdownLog,
  makeTable,
  makeRowBasedTable,
  printData,
  prettyJSONstringify,
  clearSpinner,
  printStarting,
  printDone,
  getInput,
};
