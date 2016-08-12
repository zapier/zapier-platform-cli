const querystring = require('querystring');

module.exports = {
  authorizeUrl: {
    url: 'https://example.com/oauth/authorize',
    params: {
      client_id: '{{environment.CLIENT_ID}}',
      client_secret: '{{environment.CLIENT_SECRET}}'
    }
  },
  getAccessToken: (z, bundle) => {
    const requestOptions = {
      method: 'POST',
      url: 'https://example.com/oauth/token',
      body: querystring.stringify(bundle.inputData),
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
};
