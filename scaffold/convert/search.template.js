// find a particular <%= LOWER_NOUN %> by name
const search<%= CAMEL %> = (z, bundle) => {
  const responsePromise = z.request({
    url: 'http://example.com/api/<%= KEY %>s.json',
    params: {
      name: bundle.inputData.name
    }
  });
  return responsePromise
    .then(response => JSON.parse(response.content));
};

module.exports = {
  key: '<%= KEY %>',
  noun: '<%= NOUN %>',

  display: {
    label: 'Find a <%= NOUN %>',
    description: 'Finds a <%= LOWER_NOUN %>.'
  },

  operation: {
    inputFields: [
<%= FIELDS %>
    ],
    perform: search<%= CAMEL %>
  }
};
