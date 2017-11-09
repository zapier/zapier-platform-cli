<% if (TYPE === 'basic') { %>
      {
        username: process.env.USERNAME,
        password: process.env.PASSWORD
      }
<% } else if (TYPE === 'oauth2') { %>
      {
        access_token: process.env.ACCESS_TOKEN
      }
<% } else if (TYPE === 'oauth2-refresh') { %>
      {
        access_token: process.env.ACCESS_TOKEN,
        refresh_token: process.env.REFRESH_TOKEN
      }
<% } else if (TYPE === 'api-header' || TYPE === 'api-query') { %>
      {
        apiKey: process.env.API_KEY
      }
<% } else if (TYPE === 'session') { %>
      {
        sessionKey: process.env.SESSION_KEY
      }
<% } else { %>
      {
        // TODO: Put your custom authentication data here
      }
<% } %>
