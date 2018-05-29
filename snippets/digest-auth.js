const authentication = {
  type: 'digest',
  // "test" could also be a function
  test: {
    url: 'https://example.com/api/accounts/me.json'
  },
  connectionLabel: (z, bundle) => {
    // You may define the `connectionLabel` with a string instead of a function—take a look at the Basic Auth example above.
    // bundle.inputData is an object containing the data returned by the .test function/request (assuming it returns an object).
    // For example, in this function, `bundle.inputData` would be the data returned by `https://example.com/api/accounts/me.json`.
    return bundle.inputData.email;
  }
  // you can provide additional fields, but Zapier will provide `username`/`password` automatically
};

const App = {
  // ...
  authentication: authentication
  // ...
};
