<% if (before) { %>const maybeIncludeAuth = (request, z, bundle) => {
  <%
  Object.keys(mapping).forEach((mapperKey) => {
    fields.forEach((field) => {
      if (mapping[mapperKey].indexOf(`{{${field}}}`) !== -1) {
        if (query) { %>
  request.params['<%= mapperKey %>'] = bundle.authData['<%= field %>'];
<% } else { %>
  request.headers['<%= mapperKey %>'] = bundle.authData['<%= field %>'];
<%      }
      }
    });
  });
%>
  return request;
}
<% }

if (after) { %>
const maybeRefresh = (response, z, bundle) => {
  if (response.status === 401 || response.status === 403) {
    throw new z.errors.RefreshAuthError('Session key needs refreshing.');
  }

  return response;
}
<% } %>
