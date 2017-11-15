const testTrigger = require('<%= TEST_TRIGGER_MODULE %>');

const authentication = {
  // TODO: just an example stub - you'll need to complete
  type: '<%= TYPE %>',
  test: testTrigger.operation.perform,
  fields: [
<%= FIELDS %>
  ],
  connectionLabel: '<%= CONNECTION_LABEL %>'
};

module.exports = authentication;
