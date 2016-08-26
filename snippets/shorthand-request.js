const App = {
  // ...
  triggers: {
    example: {
      // ...
      operation: {
        // ...
        perform: {
          method: 'GET'
          url: 'http://{{bundle.authData.subdomain}}.example.com/v2/api/recipes.json',
          params: {
            sort_by: 'id',
            sort_order: 'DESC'
          }
        }
      }
    }
  }
};
