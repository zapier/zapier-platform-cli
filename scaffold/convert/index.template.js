<%= REQUIRES %>

const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication: <%= AUTHENTICATION %>,

  resources: {
  },

  triggers: {
    <%= TRIGGERS %>
  },

  searches: {
    <%= SEARCHES %>
  },

  writes: {
    <%= WRITES %>
  }

};

module.exports = App;
