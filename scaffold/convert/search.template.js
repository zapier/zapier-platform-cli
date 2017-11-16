// Search stub created by 'zapier convert'. This is just a stub - you will need to edit!
<%
// Template for just _pre_search()
if (scripting && preScripting && !postScripting && !fullScripting) { %>
const getList = (z, bundle) => {
  const scripting = require('../scripting');
  const legacyScriptingRunner = require('zapier-platform-legacy-scripting-runner')(scripting);

  bundle._legacyUrl = '<%= URL %>';

  // Do a _pre_search() from scripting.
  const preSearchEvent = {
    name: 'search.pre',
    key: '<%= KEY %>'
  };
  return legacyScriptingRunner.runEvent(preSearchEvent, z, bundle)
    .then((preSearchResult) => z.request(preSearchResult))
    .then((response) => z.JSON.parse(response.content));
};
<%
}

// Template for _pre_search() + _post_search()
if (scripting && preScripting && postScripting && !fullScripting) { %>
const getList = (z, bundle) => {
  const scripting = require('../scripting');
  const legacyScriptingRunner = require('zapier-platform-legacy-scripting-runner')(scripting);

  bundle._legacyUrl = '<%= URL %>';

  // Do a _pre_search() from scripting.
  const preSearchEvent = {
    name: 'search.pre',
    key: '<%= KEY %>'
  };
  return legacyScriptingRunner.runEvent(preSearchEvent, z, bundle)
    .then((preSearchResult) => z.request(preSearchResult))
    .then((response) => {
      // Do a _post_search() from scripting.
      const postSearchEvent = {
        name: 'search.post',
        key: '<%= KEY %>',
        response
      };
      return legacyScriptingRunner.runEvent(postSearchEvent, z, bundle);
    });
};
<%
}

// Template for just _post_search()
if (scripting && !preScripting && postScripting) { %>
const getList = (z, bundle) => {
  const scripting = require('../scripting');
  const legacyScriptingRunner = require('zapier-platform-legacy-scripting-runner')(scripting);

  bundle._legacyUrl = '<%= URL %>';

  const responsePromise = z.request({
    url: bundle._legacyUrl
  });
  return responsePromise
    .then((response) => {
      // Do a _post_search() from scripting.
      const postSearchEvent = {
        name: 'search.post',
        key: '<%= KEY %>',
        response
      };
      return legacyScriptingRunner.runEvent(postSearchEvent, z, bundle);
    });
};
<%
}

// Template for just _search()
if (scripting && fullScripting) { %>
const getList = (z, bundle) => {
  const scripting = require('../scripting');
  const legacyScriptingRunner = require('zapier-platform-legacy-scripting-runner')(scripting);

  bundle._legacyUrl = '<%= URL %>';

  // Do a _search() from scripting.
  const fullSearchEvent = {
    name: 'search.search',
    key: '<%= KEY %>',
  };
  return legacyScriptingRunner.runEvent(fullSearchEvent, z, bundle);
};
<%
}

// If there's no scripting, it's even sweeter and simpler!
if (!scripting) { %>
const getList = (z, bundle) => {
  const responsePromise = z.request({
    url: '<%= URL %>'
  });
  return responsePromise
    .then(response => z.JSON.parse(response.content));
};
<% } %>

module.exports = {
  key: '<%= KEY %>',
  noun: '<%= NOUN %>',

  display: {
    label: '<%= LABEL %>',
    description: '<%= DESCRIPTION %>',
    hidden: <%= HIDDEN %>,
    important: <%= IMPORTANT %>
  },

  operation: {
    inputFields: [
<%= FIELDS %>
    ],
<%= SAMPLE %>
    perform: getList
  }
};
