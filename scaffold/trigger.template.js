// find a particular <%= LOWER_NOUN %> by name
const trigger<%= CAMEL %> = (z, bundle) => {
  const responsePromise = z.request({
    url: 'http://example.com/api/<%= KEY %>s.json',
    params: {
      tag: bundle.inputData.tagName
    }
  });
  return responsePromise
    .then(response => JSON.parse(response.content));
};

module.exports = {
  key: '<%= KEY %>',
  noun: '<%= NOUN %>',

  display: {
    label: 'Get <%= NOUN %>',
    description: 'Gets a <%= LOWER_NOUN %>.'
  },

  operation: {
    inputFields: [
      {key: 'tagName', required: true}
    ],
    perform: trigger<%= CAMEL %>
  }
};
