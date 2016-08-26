const App = {
  // ...
  triggers: {
    example: {
      // ...
      operation: {
        // ...
        perform: {
          url: 'http://example.com/api/v2/recipes.json'
          headers: {
            'my-header': '{{bundle.environment.MY_SECRET_VALUE}}'
          }
        }
      }
    }
  }
};
