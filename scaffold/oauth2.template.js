const querystring = require('querystring');

module.exports = {
  type: 'oauth2',
  test: {
    url: 'https://example.com/api/me.json'
  },
  oauth2Config: {
    authorizeUrl: {
      url: 'https://example.com/oauth/authorize',
      params: {
        client_id: '{{bundle.environment.CLIENT_ID}}',
        response_type: 'code'
      }
    },
    getAccessToken: (z, bundle) => {
      const requestOptions = {
        method: 'POST',
        url: 'https://example.com/oauth/token',
        body: querystring.stringify({
          code: bundle.inputData.code,
          client_id: bundle.environment.CLIENT_ID,
          client_secret: bundle.environment.CLIENT_SECRET,
          grant_type: 'authorization_code'
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      return z.request(requestOptions)
        .then((response) => {
          const data = JSON.parse(response.content);
          if (response.status !== 200) {
            throw new Error(data.error_description);
          }
          return data;
        });
    },
    scope: 'read,write',
    autoRefresh: false
  }
};
