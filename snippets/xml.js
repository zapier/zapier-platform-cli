const xml = require('pixl-xml');

const App = {
  // ...
  afterRequest: [
    (response, z, bundle) => {
      response.xml = xml.parse(response.content);
      return response;
    }
  ]
  // ...
};
