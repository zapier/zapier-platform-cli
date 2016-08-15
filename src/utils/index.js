const _ = require('lodash');

module.exports = _.extend(
  {},
  require('./context'),
  require('./files'),
  require('./display'),
  require('./api'),
  require('./misc'),
  require('./args'),
  require('./build')
);
