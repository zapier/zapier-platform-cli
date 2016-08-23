const helloWorld = {
  key: 'helloWorld',

  noun: 'Greeting',
  display: {
    label: 'New Greeting',
    description: 'Trigger when a new greeting is available.'
  },

  operation: {
    inputFields: [
      {key: 'planet', type: 'string', required: true},
    ],
    perform: (z, bundle) => {
      z.console.log(`console says hello ${bundle.inputData.planet}!`);
      return Promise.resolve()
        .then(() => {
          return [{
            id: 1,
            greeting: 'hello',
            planet: bundle.inputData.planet
          }, {
            id: 2,
            greeting: 'howdy',
            planet: bundle.inputData.planet
          }];
        });
    }
  }
};

const App = {
  version: require('./package.json').version,
  platformVersion: require('./package.json').dependencies['@zapier/zapier-platform-core'],

  beforeRequest: [

  ],

  afterResponse: [

  ],

  resources: {

  },

  triggers: {
    [helloWorld.key]: helloWorld
  },

  searches: {

  },

  writes: {

  }
};

module.exports = App;
