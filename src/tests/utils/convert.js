const crypto = require('crypto');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

require('should');

const { convertLegacyApp, convertVisualApp } = require('../../utils/convert');

const legacyAppDefinition = {
  beforeRequest: [
    {
      args: ['request', 'z', 'bundle'],
      source: 'return request;'
    }
  ],
  afterResponse: [
    {
      args: ['response', 'z', 'bundle'],
      source: 'return response;'
    }
  ],
  authentication: {
    type: 'custom',
    test: {
      source: "return 'test';"
    },
    fields: [{ key: 'api_key', required: true, type: 'string' }]
  },
  triggers: {
    movie: {
      key: 'movie',
      noun: 'Movie',
      display: {},
      operation: {
        perform: {
          source: "return 'test';"
        }
      }
    }
  }
};

const visualAppDefinition = {
  definition_override: {
    platformVersion: '8.0.1',
    creates: {
      create_project: {
        operation: {
          perform: {
            body: {
              name: '{{bundle.inputData.name}}',
              public: '{{bundle.inputData.public}}'
            },
            url: 'https://api.wistia.com/v1/projects.json',
            removeMissingValuesFrom: {},
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer {{bundle.authData.access_token}}',
              Accept: 'application/json'
            },
            params: {},
            method: 'POST'
          },
          inputFields: [
            {
              required: true,
              list: false,
              label: 'Project Name',
              key: 'name',
              type: 'string',
              altersDynamicFields: false
            },
            {
              required: false,
              list: false,
              label: 'Public?',
              key: 'public',
              type: 'boolean',
              altersDynamicFields: false
            }
          ]
        },
        noun: 'Project',
        display: {
          hidden: false,
          important: true,
          description: 'asdfasda asdf asd fasd f',
          label: 'Create a New Project'
        },
        key: 'create_project'
      }
    },
    authentication: {
      test: {
        body: {},
        url: 'https://api.wistia.com/v1/account.json',
        removeMissingValuesFrom: {},
        headers: {
          Authorization: 'Bearer {{bundle.authData.access_token}}'
        },
        params: {},
        method: 'GET'
      },
      oauth2Config: {
        authorizeUrl: {
          url:
            'https://app.wistia.com/oauth/authorize?client_id=03e84930b97011c7bd674f6d02c04ec9c1a430325a73a0501eb443ef07b6b99c&redirect_uri=https%3A%2F%2Fzapier.com%2Fdashboard%2Fauth%2Foauth%2Freturn%2FApp17741CLIAPI%2F&response_type=code',
          params: {
            state: '{{bundle.inputData.state}}',
            redirect_uri: '{{bundle.inputData.redirect_uri}}',
            response_type: 'code',
            client_id: '{{process.env.CLIENT_ID}}'
          },
          method: 'GET'
        },
        refreshAccessToken: {
          body: {
            grant_type: 'refresh_token',
            refresh_token: '{{bundle.authData.refresh_token}}'
          },
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            accept: 'application/json'
          },
          method: 'POST'
        },
        getAccessToken: {
          body: {
            redirect_uri: '{{bundle.inputData.redirect_uri}}',
            client_secret: '{{process.env.CLIENT_SECRET}}',
            code: '{{bundle.inputData.code}}',
            client_id: '{{process.env.CLIENT_ID}}',
            grant_type: 'authorization_code'
          },
          url: 'https://api.wistia.com/oauth/token',
          removeMissingValuesFrom: {},
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            accept: 'application/json'
          },
          params: {},
          method: 'POST'
        }
      },
      type: 'oauth2',
      connectionLabel: '{{name}}'
    },
    version: '1.0.1',
    triggers: {
      project: {
        operation: {
          perform: {
            body: {},
            url: 'https://api.wistia.com/v1/projects.json',
            removeMissingValuesFrom: {},
            headers: {
              Authorization: 'Bearer {{bundle.authData.access_token}}',
              Accept: 'application/json'
            },
            params: { sort_direction: '0', sort_by: 'created' },
            method: 'GET'
          }
        },
        noun: 'Project',
        display: {
          directions: 'this is help text, where does it go?',
          hidden: false,
          important: true,
          description: 'Triggers on a new project created',
          label: 'New Project'
        },
        key: 'project'
      },
      codemode: {
        operation: {
          perform: {
            source:
              "const options = {\n  url: 'https://jsonplaceholder.typicode.com/posts',\n  method: 'GET',\n  headers: {\n    'Accept': 'application/json'\n  },\n  params: {\n    '_limit': '3'\n  }\n}\n\nreturn z.request(options)\n  .then((response) => {\n    response.throwForStatus();\n    const results = z.JSON.parse(response.content);\n\n    // You can do any parsing you need for results here before returning them\n\n    return results;\n  });"
          }
        },
        noun: 'Code',
        display: {
          hidden: false,
          important: true,
          description: "just runs some code, let's go",
          label: 'New Code Trigger'
        },
        key: 'codemode'
      }
    }
  }
};

const legacyApp = {
  general: {
    title: 'My Name Is',
    description: 'Just an example app.',
    app_id: 888
  }
};

const setupTempWorkingDir = () => {
  let workdir;
  const tmpBaseDir = os.tmpdir();
  while (!workdir || fs.existsSync(workdir)) {
    workdir = path.join(tmpBaseDir, crypto.randomBytes(20).toString('hex'));
  }
  fs.mkdirSync(workdir);
  return workdir;
};

describe('convert', () => {
  let tempAppDir;

  beforeEach(() => {
    tempAppDir = setupTempWorkingDir();
  });

  afterEach(() => {
    fs.removeSync(tempAppDir);
  });

  describe('legacy apps', () => {
    it('should create separate files', async () => {
      await convertLegacyApp(legacyApp, legacyAppDefinition, tempAppDir, true);
      [
        '.zapierapprc',
        '.gitignore',
        '.env',
        'package.json',
        'index.js',
        'triggers/movie.js',
        'test/triggers/movie.js'
      ].forEach(filename => {
        const filepath = path.join(tempAppDir, filename);
        fs.existsSync(filepath).should.be.true(`failed to create ${filename}`);
      });
    });
  });

  describe('visual apps apps', () => {
    it('should create separate files', async () => {
      await convertVisualApp(
        legacyApp.general,
        visualAppDefinition,
        tempAppDir,
        true
      );
      [
        '.zapierapprc',
        '.gitignore',
        '.env',
        'package.json',
        'index.js',
        'triggers/codemode.js',
        'triggers/project.js',
        'creates/create_project.js',
        'test/triggers/codemode.js',
        'test/triggers/project.js',
        'test/creates/create_project.js',
        'authentication.js'
      ].forEach(filename => {
        const filepath = path.join(tempAppDir, filename);
        fs.existsSync(filepath).should.be.true(`failed to create ${filename}`);
      });
    });
  });
});
