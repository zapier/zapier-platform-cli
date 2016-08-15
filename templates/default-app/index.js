// ## Welcome to our example app!
// This is a small example, all in one file. You can get a clone and start it from
// `zapier start "Your App Name" --style=helloworld`. You can of course break apart
// your example app, no reason to make it a single file. Also, we recommend taking
// a look at the automated tests you can do via `npm test`!


// We recommend writing your triggers separate like this and rolling them
// into the App definition at the end.
const hello_world = {
  key: 'hello_world',

  // You'll want to provide some helpful display labels and descriptions
  // for users. Zapier will put them into the UX.
  noun: 'Greeting',
  display: {
    label: 'New Greeting',
    description: 'Trigger when a new greeting is available.'
  },

  // `operation` is where the business logic goes.
  operation: {

    // `inputFields` can define the fields a user could provide,
    // we'll pass them in as `bundle.inputData` later.
    inputFields: [
      {key: 'kitty_style', type: 'string'},
    ],

    perform: (z, bundle) => {
      // `z.console.log()` is similar to `console.log()`.
      z.console.log('console says hello world!');

      // You can build requests and our client will helpfully inject all the variables
      // you need to complete. You can also register middleware to control this.
      const promise = z.request({
        url: 'http://httpbin.org/get?hello=world&kitty={{inputData.kitty_style}}',
        params: {
          kitty_duplicate: bundle.inputData.kitty_style
        }
      });

      // You may return a promise or a normal data structure from any perform method.
      return promise
        .then((resp) => {
          return [{
            id: 123,
            hello: 'world',
            rawHeaders: resp.headers,
            rawContent: resp.content
          }];
        });
    }
  }
};

// Now we can roll up all our behaviors in an App.
const App = {
  // Not "strictly" required as you'll get a chance to,
  title: 'Hello World App',
  description: 'This is my a hello world app!',

  // This is just shorthand to reference the installed dependencies you have. Zapier will
  // need to know these before we
  version: require('./package.json').version,
  platformVersion: require('./package.json').dependencies['@zapier/zapier-platform-core'],

  // If you want your trigger to show up, you better include it here!
  triggers: {
    [hello_world.key]: hello_world
  }
};

// Finally, export the app.
module.exports = App;
