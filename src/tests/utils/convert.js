require('should');
const convert = require('../../utils/convert');
const definitions = {
  basic: require('./definitions/basic.json'),
  apiHeader: require('./definitions/api-header.json'),
  // TODO: apiQuery: require('./definitions/api-query.json'),
  // TODO: session: require('./definitions/session.json'),
  // TODO: oauth2: require('./definitions/oauth2.json'),
};

/* eslint no-eval: 0 */
const s2js = (string) => eval(`const AuthTest = { operation: { perform: 'PerformFunction' } }; (${string})`);

describe('convert render functions', () => {

  describe('render field', () => {
    it('should render a string field', () => {
      const wbKey = 'test_field';
      const wbDef = {
        label: 'test field',
        type: 'Unicode',
        required: true,
        help_text: 'help text goes here'
      };

      const string = convert.renderField(wbDef, wbKey);
      const field = s2js(string);
      field.should.eql({
        key: 'test_field',
        label: 'test field',
        type: 'string',
        required: true,
        helpText: 'help text goes here'
      });
    });

    it('should pad help text that is too short', () => {
      const wbKey = 'test_field';
      const wbDef = {
        help_text: 'too short'
      };

      const string = convert.renderField(wbDef, wbKey);
      const field = s2js(string);
      field.helpText.should.eql('too short (help text must be at least 10 characters)');
    });
  });

  describe('authentication', () => {
    it('should render basic auth', (done) => {
      const wbDef = definitions.basic;

      convert.renderAuth(wbDef)
        .then(string => {
          const auth = s2js(string);
          auth.should.eql({
            type: 'basic',
            test: 'PerformFunction',
            fields: [
              {
                key: 'username',
                type: 'string',
                required: true,
                label: 'Username',
                helpText: '(help text must be at least 10 characters)'
              },
              {
                key: 'password',
                type: 'password',
                required: true,
                label: 'Password',
                helpText: '(help text must be at least 10 characters)'
              }
            ]
          });
          done();
        })
        .catch(done);
    });

    // TODO: api keys header
    // TODO: api keys query
    // TODO: session

    it.skip('TODO: should render oauth2', (done) => {
      const wbDef = definitions.oauth2;

      convert.renderAuth(wbDef)
        .then(string => {
          const auth = s2js(string);

          auth.should.eql({
            type: 'oauth2',
            test: {
              url: 'http://www.example.com/auth'
            },
            oauth2Config: {
              authorizeUrl: {
                method: 'GET',
                url: 'https://example.com/api/oauth2/authorize',
                params: {
                  client_id: '{{process.env.CLIENT_ID}}',
                  state: '{{bundle.inputData.state}}',
                  redirect_uri: '{{bundle.inputData.redirect_uri}}',
                  response_type: 'code'
                }
              },
              getAccessToken: {
                method: 'POST',
                url: 'https://example.com/api/v2/oauth2/token',
                body: {
                  code: '{{bundle.inputData.code}}',
                  client_id: '{{process.env.CLIENT_ID}}',
                  client_secret: '{{process.env.CLIENT_SECRET}}',
                  redirect_uri: '{{bundle.inputData.redirect_uri}}',
                  grant_type: 'authorization_code'
                },
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
              }
            }
          });
          done();
        })
        .catch(done);
    });

  });

  describe('render sample', () => {
    it('should render sample output fields', () => {
      const wbDef = {
        sample_result_fields: [
          { type: 'float', key: 'bounds__northeast__lat' },
          { type: 'float', key: 'bounds__northeast__lng' },
          { type: 'float', key: 'bounds__southwest__lat' },
          { type: 'float', key: 'bounds__southwest__lng' },
          { type: 'unicode', key: 'copyrights', label: 'Copyright' },
          { type: 'unicode', key: 'legs[]duration__text', important: true, label: 'Legs Duration' },
        ]
      };

      const string = '{' + convert.renderSample(wbDef) + '}';
      const fields = s2js(string);
      fields.should.eql({
        outputFields: [
          { type: 'number', key: 'bounds__northeast__lat' },
          { type: 'number', key: 'bounds__northeast__lng' },
          { type: 'number', key: 'bounds__southwest__lat' },
          { type: 'number', key: 'bounds__southwest__lng' },
          { type: 'string', key: 'copyrights', label: 'Copyright' },
          { type: 'string', key: 'legs[]duration__text', label: 'Legs Duration' },
        ]
      });
    });
  });

  // TODO: getHeader

  // TODO: renderIndex
});
