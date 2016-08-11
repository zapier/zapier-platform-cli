const readline = require('readline');

// could we explore https://www.npmjs.com/package/columnify
// to simplify the columns/tables? the | - decoration is big
const Table = require('cli-table2');
const colors = require('colors/safe');
const stringLength = require('string-length');
const _ = require('lodash');

const markdownLog = (str) => {
  // turn markdown into something with styles and stuff
  // https://blog.mariusschulz.com/content/images/sublime_markdown_with_syntax_highlighting.png
  console.log(str);
};

// Convert rows from keys to column labels.
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

// An easier way to print rows for copy paste accessibility.
const makePlain = (rows, columnDefs) => {
  return rewriteLabels(rows, columnDefs).map((row) => {
    return _.map(row, (value, key) => {
      return (colors.grey('==') + ' ' + colors.bold(key) + '\n' + value).trim();
    }).join('\n');
  }).join('\n\n---\n\n');
};

// Wraps the cli-table2 library. Rows is an array of objects, columnDefs
// an ordered sub-array [[label, key, (optional_default)], ...].
const makeTable = (rows, columnDefs) => {
  const tableOptions = {
    head: columnDefs.map(([label]) => label),
    style: {
      compact: true,
      head: ['bold']
    }
  };
  const table = new Table(tableOptions);

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
    return makeRowBasedTable(rows, columnDefs, {includeIndex: false});
  }

  return strTable;
};

// Similar to makeTable, but prints the column headings in the left-hand column
// and the values in the right-hand column, in rows
const makeRowBasedTable = (rows, columnDefs, {includeIndex = true} = {}) => {
  const tableOptions = {
    style: {
      compact: true
    }
  };
  const table = new Table(tableOptions);

  const maxLabelLength = _.reduce(columnDefs, (maxLength, columnDef) => {
    if (columnDef[0] && stringLength(columnDef[0]) > maxLength) {
      return stringLength(columnDef[0]);
    }
    return maxLength;
  }, 1);
  const widthForValue = process.stdout.columns - maxLabelLength - 15; // The last bit accounts for some padding and borders

  rows.forEach((row, index) => {
    if (includeIndex) {
      table.push([{colSpan: 2, content: colors.grey(`= ${index + 1} =`)}]);
    }

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
      let colLabel = '    ' + colors.bold(label);
      if (!includeIndex) {
        colLabel = colors.bold(label) + '   ';
      }
      consumptionRow[colLabel] = val.trim();
      table.push(consumptionRow);
    });

    if (index < rows.length - 1) {
      table.push([{colSpan: 2, content: '  '}]);
    }
  });

  return table.toString().trim();
};

const prettyJSONstringify = (obj) => JSON.stringify(obj, null, '  ');

const makeJSON = (rows, columnDefs) => prettyJSONstringify(rewriteLabels(rows, columnDefs));
const makeRawJSON = (rows) => prettyJSONstringify(rows);

const DEFAULT_STYLE = 'table';
const formatStyles = {
  'plain': makePlain,
  'json': makeJSON,
  'raw': makeRawJSON,
  'raw-json': makeRawJSON,
  'json-raw': makeRawJSON,
  'row': makeRowBasedTable,
  'row-based': makeRowBasedTable,
  'table': makeTable
};

const printData = (rows, columnDefs, ifEmptyMessage = '', useRowBasedTable = false) => {
  const formatStyle = global.argOpts.format || (useRowBasedTable ? 'row-based' : DEFAULT_STYLE);
  const formatter = formatStyles[formatStyle] || formatStyles[DEFAULT_STYLE];
  if (rows && !rows.length) {
    console.log(ifEmptyMessage);
  } else {
    console.log(formatter(rows, columnDefs));
  }
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
