const _ = require('lodash');

module.exports = _.extend(
  {},
  require('./files'),
  require('./display'),
  require('./api'),
  require('./misc'),
  require('./build'),
  require('./fragments')
);
