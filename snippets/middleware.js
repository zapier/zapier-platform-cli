const App = {
  // ...
  beforeRequest: [
    (request) => {
      request.headers['my-header'] = 'from zapier';
      return request;
    }
  ],
  afterRequest: [
    (response) => {
      if (response.status !== 200) {
        throw new Error(`Unexpected status code ${response.status}`);
      }
      return response;
    },
    (response) => {
      response.json = JSON.parse(response.content);
      return response;
    }
  ]
  // ...
