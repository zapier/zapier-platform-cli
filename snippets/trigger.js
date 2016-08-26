const App = {
  //...
  triggers: {
    new_recipe: {
      // `key` uniquely identifies the trigger to the Zapier backend
      key: 'new_recipe',
      // `noun` is the user-friendly word that is used to refer to the resource this trigger relates to
      noun: 'Recipe',
      // `display` controls the presentation in the Zapier Editor
      display: {
        label: 'New Recipe',
        helpText: 'Triggers when a new recipe is added.'
      }
      // `operation` implements the API call used to fetch the data
      operation: {
        url: 'http://example.com/recipes',
      }
    },
    {
      //... Another trigger
    }
  }
};
