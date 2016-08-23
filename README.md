# Introduction

Zapier is a platform for creating integrations and workflows. This CLI is your gateway to creating custom applications on the Zapier platform.


## Getting Started

> The Zapier CLI and Platform requires Node `v4.3.2` or higher. We recommend using [nvm](https://github.com/creationix/nvm) and [homebrew](http://brew.sh/) to manage your Node installation.

First up is installing the CLI and setting up your auth to create a working "Hello World" application. It will be private to you and visible in your live [Zapier editor](https://zapier.com/app/editor).

```bash
# install the CLI globally
npm install -g @zapier/zapier-platform-cli

# print all the commands
zapier help

# auth to Zapier's platform with your deploy key. To obtain a key, email partner@zapier.com
zapier auth
```

Your Zapier CLI should be installed and ready to go at this point. Next up, we'll create our first app!

```bash
# make your folder
mkdir helloworld
cd helloworld

# create the needed files from a template
zapier init --template=helloworld

# install all the libraries needed for your app
npm install
```

You should now have a working local app. You can run several local commands to try it out.

```bash
# validate the app
zapier validate

# describe the app
zapier describe

# run the local tests
# the same as npm test
zapier test
```

Next, you'll probably want to register your app and upload your version to Zapier itself so you can start testing live.

```bash
# register and deploy your app & version to Zapier
zapier register "Hello World"
zapier deploy

# list your apps
zapier apps

# list your versions
zapier versions
```

If you open the editor in Zapier, you should now see "Hello World (1.0.0)" listed and usable! We recommend using our built in `watch` command to iterate on the app.

```bash
# watch and sync up your local app to zapier
zapier watch

# now make changes locally, and see them reflected live in Zapier
# method calls will also be proxied and logged to stdout for convenience
```

Don't forget you'll need to `zapier deploy` to make your changes stick after any `zapier watch` session!

> Go check out our [full CLI reference documentation](docs/cli.md) to see all the other commands!


## Project Structure

In your `helloworld` folder, you should see this general structure. The `index.js` is Zapier's entry point to your app. Zapier expects you to export an `App` definition there.

```plain
$ tree .
.
├── README.md
├── index.js
├── package.json
├── test
│   ├── basic.js
│   └── triggers.js
├── build
│   └── build.zip
└── node_modules
    ├── ...
    └── ...
```


## Apps & Versions Overview

In Zapier's Platform there are two primary records you'll interact with via the CLI:

* **App** - the base record that defines your App, named like "Joe's CRM". Most people have one of these.
* **Version** - a distinct implementation of an App, named like "1.0.0". Most people have many of these.

If you'd like to manage your **App**, use these commands:

* `zapier apps` - list the apps in Zapier you can administer
* `zapier register "Name"` - creates a new app in Zapier
* `zapier link` - lists and links a selected app in Zapier to your current folder
* `zapier history` - print the history of your app

If you'd like to manage your **Version**, use these commands:

* `zapier versions` - list the versions for the current directory's app
* `zapier deploy` - deploy the current version the of current directory's app & version (read from `package.json`)
* `zapier promote [1.0.0]` - mark a version as the "production" version
* `zapier migrate [1.0.0] [1.0.1] [100%]` - move users between versions, regardless of deployment status
* `zapier deprecate [1.0.0] [YYYY-MM-DD]` - mark a version as deprecated, but let users continue to use it (we'll email them)
* `zapier env 1.0.0 [KEY] [value]` - set an environment variable to some value

> Note: there is a distinction between your _local_ environment and what is deployed to Zapier - you could have many versions deployed with users on each. Making changes locally never impacts users until you `zapier promote` (even changes deployed by `zapier watch`). Likewise, deploying one version will not impact other versions - they are completely isolated.

### App Definition

The core definition of your `App` will look something like this, and is what your `index.js` should provide as the _only_ export:

```javascript
const App = {
  // both version strings are required
  version: require('./package.json').version,
  platformVersion: require('./package.json').dependencies['@zapier/zapier-platform-core'],

  // see "Authentication" section below
  authentication: {},

  // see "Making HTTP Requests" section below
  requestTemplate: {},
  beforeRequest: [],
  afterResponse: [],

  // See "Resources" section below
  resources: {},

  // See "Triggers/Searches/Writes" section below
  triggers: {},
  searches: {},
  writes: {}
};

module.export = App;
```


## Authentication

Most applications require some sort of authentication - and Zapier provides a handful of methods for helping your users authenticate with your application. Zapier will provide some of the core behaviors, but you'll likely need to handle the rest.

> Hint: You can access the data tied to your authentication via the `bundle.authData` property in any method called in your app.

### Basic

Useful if your app requires two pieces of information to authentication: `username` and `password` which only the end user can provide. By default, Zapier will do the standard Basic authentication base64 header encoding for you (via an automatically registered middleware).

> Note: if you do the common `Authorization: Basic apikey:x` you should look at the "Custom" authentication method instead.

```javascript
const App = {
  // ...
  authentication: {
    type: 'basic',
    // "test" could also be a function
    test: {
      url: 'https://example.com/api/accounts/me.json'
    }
    // you can provide additional fields, but we'll provide `username`/`password` automatically
  },
};
```

### Custom

This is what most "API Key" driven apps should default to using. You'll likely provide some some custom `beforeRequest` middleware or a `requestTemplate` to complete the authentication by adding/computing needed headers.

```javascript
const App = {
  // ...
  authentication: {
    type: 'custom',
    // "test" could also be a function
    test: {
      url: 'https://{{bundle.authData.subdomain}}.example.com/api/accounts/me.json'
    },
    fields: [
      {key: 'subdomain', type: 'string', required: true, helpText: 'Found in your browsers address bar after logging in.'}
      {key: 'api_key', type: 'string', required: true, helpText: 'Found on your settings page.'}
    ]
  },
  beforeRequest: [
    (request, z, bundle) => {
      request.headers['X-Api-Key'] = bundle.authData.api_key;
      return request;
    }
  ]
};
```

### Digest

Very similar to the "Basic" authentication method above, but uses digest authentication instead of Basic authentication.

```javascript
const App = {
  // ...
  authentication: {
    type: 'digest',
    // "test" could also be a function
    test: {
      url: 'https://example.com/api/accounts/me.json'
    }
    // you can provide additional fields, but Zapier will provide `username`/`password` automatically
  },
};
```

### Session

TODO.

### OAuth2

Zapier will handle most of the logic around the 3 step OAuth flow, but you'll be required to define how the steps work on your own. You'll also likely want to set your `CLIENT_ID` and `CLIENT_SECRET` as environment variables:

```bash
# setting the environment variables on Zapier.com
$ zapier env 1.0.0 CLIENT_ID 1234
$ zapier env 1.0.0 CLIENT_SECRET abcd

# and when running tests locally, don't forget to define them!
$ CLIENT_ID=1234 CLIENT_SECRET=abcd zapier test
```

Your auth definition would look something like this:

```javascript
const App = {
  // ...
  authentication: {
    type: 'oauth2',
    test: {
      url: 'https://example.com/api/accounts/me.json'
    },
    // you can provide additional fields for inclusion in authData
    oauth2Config: {
      // "authorizeUrl" could also be a function returning a string url
      authorizeUrl: {
        method: 'GET',
        url: 'https://example.com/api/oauth2/authorize',
        params: {
          client_id: '{{bundle.environment.CLIENT_ID}}',
          state: '{{bundle.inputData.state}}',
          redirect_uri: '{{bundle.inputData.redirect_uri}}',
          response_type: 'code'
        }
      },
      // Zapier expects a response providing {access_token: 'abcd'}
      // "getAccessToken" could also be a function returning an object
      getAccessToken: {
        method: 'POST',
        url: 'https://example.com/api/v2/oauth2/token',
        body: {
          code: '{{bundle.inputData.code}}',
          client_id: '{{bundle.environment.CLIENT_ID}}',
          client_secret: '{{bundle.environment.CLIENT_SECRET}}',
          redirect_uri: '{{bundle.inputData.redirect_uri}}',
          state: '{{bundle.inputData.state}}',
          grant_type: 'authorization_code'
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    }
  },
  beforeRequest: [
    (request, z, bundle) => {
      request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
      return request;
    }
  ]
};
```


## Resources

A `resource` is a representation (as a JavaScript object) of one of the REST resources of your API. Say you have a `/movies`
endpoint for working with movies; you can define a movie resource in your app that will tell Zapier how to do create,
read, and search operations on that resource.

```javascript
const Movie = {
  // `key` is the unique identifier the Zapier backend references
  key: 'movie',
  // `noun` is the user-friendly name displayed in the Zapier UI
  noun: 'Movie',
  // `list` and `create` are just a couple of the methods you can define
  list: {
      //...
  },
  create: {
      //...
  }
}
```

The quickest way to create a resource is with the `zapier scaffold` command:

```bash
zapier scaffold resource "Movie"
```

This will generate the resource file and add the necessary statements to the `index.js` file to import it.


### Resource Definition

A resource has a few basic properties. The first is the `key`, which allows Zapier to identify the resource on our backend.
The second is the `noun`, the user-friendly name of the resource that is presented to users throughout the Zapier UI.

After those, there is a set of optional properties that tell Zapier what methods can be performed on the resource.
The complete list of available methods can be found in the [Resource Schema Docs](https://github.com/zapier/zapier-platform-schema/blob/master/docs/build/schema.md#resourceschema).
For now, let's focus on two:

 * `list` - Tells Zapier how to fetch a set of this resource. This becomes a Trigger in the Zapier Editor.
 * `create` - Tells Zapier how to create a new instance of the resource. This becomes an Action in the Zapier Editor.

Here is a complete example of what the list method might look like

```javascript
const Movie = {
  //...
  list: {
    display: {
      label: 'New Movie',
      description: 'Triggers when a new movie is added.'
    },
    operation: {
      perform: {
        url: `http://example.com/movies`
      }
    }
  }
}
```

The method is made up of two properties, a `display` and an `operation`. The `display` property ([schema](https://github.com/zapier/zapier-platform-schema/blob/master/docs/build/schema.md#basicdisplayschema)) holds the info needed to present the method as an available Trigger in the Zapier Editor. The `operation` ([schema](https://github.com/zapier/zapier-platform-schema/blob/master/docs/build/schema.md#resourceschema)) provides the implementation to make the API call.

Adding a create method looks very similar.

```javascript
const Movie = {
  //...
  list: {
    //...
  },
  create: {
    display: {
      label: 'Add Movie',
      description: 'Adds a new movie to the catalog.'
    },
    operation: {
      perform: {
        url: `http://example.com/movies`,
        method: 'POST',
        body: {
          title: 'Casablanca',
          genre: 'romance'
        }
      }
    }
  }
}
```

Every method you define on a `resource` Zapier converts to the appropriate Trigger, Write, or Search. Our examples
above would result in an app with a New Movie Trigger and an Add Movie Write.


## Triggers/Searches/Writes

Triggers, Searches, and Writes are the way an app defines what it is able to do. Triggers read
data into Zapier (i.e. watch for new movies). Searches locate individual records (find movie by title). Writes create
new records in your system (add a movie to the catalog).

The definition for each of these follows the same structure. Here is an example of a trigger:

```javascript
const App = {
  //...
  triggers: {
    new_movie: {
      // `key` uniquely identifies the trigger to the Zapier backend
      key: 'new_movie',
      // `noun` is the user-friendly word that is used to refer to the resource this trigger relates to
      noun: 'Movie',
      // `display` controls the presentation in the Zapier Editor
      display: {
        label: 'New Movie',
        helpText: 'Triggers when a new movie is released.'
      }
      // `operation` implements the API call used to fetch the data
      operation: {
        url: 'http://example.com/movies',
      }
    },
    {
      //... Another trigger
    }
  }
};
```

You can find more details on the definition for each by looking at the [Trigger Schema](https://github.com/zapier/zapier-platform-schema/blob/master/docs/build/schema.md#triggerschema),
[Search Schema](https://github.com/zapier/zapier-platform-schema/blob/master/docs/build/schema.md#searchschema), and [Write Schema](https://github.com/zapier/zapier-platform-schema/blob/master/docs/build/schema.md#writeschema).


## Making HTTP Requests

There are two primary ways to make HTTP requests in the Zapier platform:

1. **Shorthand HTTP Requests** - these are simple object literals that make it easy to define simple requests.
1. **Manual HTTP Requests** - this is much less "magic", you use `z.request()` to make the requests and control the response.

There are also a few helper constructs you can use to reduce boilerplate:

1. `requestTemplate` which is an shorthand HTTP request that will be merged with every request.
2. `beforeRequest` middleware which is an array of functions to mutate a request before it is sent.
2. `afterResponse` middleware which is an array of functions to mutate a response before it is completed.


### Shorthand HTTP Requests

For simple HTTP requests that do not require special pre or post processing, you can specify the HTTP options as an object literal in your app definition.

This features:

1. Lazy `{{curly}}` replacement.
2. JSON de-serialization.
3. Automatic non-2xx error raising.

```javascript
const App = {
  // ...
  triggers: {
    example: {
      // ...
      operation: {
        // ...
        perform: {
          method: 'GET'
          url: 'http://{{bundle.authData.subdomain}}.example.com/api/v2/records.json',
          params: {
            sort_by: 'id',
            sort_order: 'DESC'
          }
        }
      }
    }
  }
};
```

In the url above, `{{bundle.authData.subdomain}}` is automatically replaced with the live value from the bundle. If the call returns a non 2xx return code, an error is automatically raised. The response body is automatically parsed as JSON and returned.

An error will be raised if the response is not valid JSON, so _do not use shorthand HTTP requests with non-JSON responses_.

### Manual HTTP Requests

When you need to do custom processing of the response, or need to process non-JSON responses, you can make manual HTTP requests. This approach does not perform any magic - no `{{curly}}` replacement, no status code checking, no automatic JSON parsing. Use this method when you need more control.

To make a manual HTTP request, use the `request` method of the `z` object:

```javascript
const App = {
  // ...
  triggers: {
    example: {
      // ...
      operation: {
        // ...
        perform: (z, bundle) => {
          const customHttpOptions = {
            headers: {
              'my-header': 'from zapier'
            }
          };

          return z.request('http://example.com/api/v2/movies.json', customHttpOptions)
            .then(response => {
              if (response.status >= 300) {
                throw new Error(`Unexpected status code ${response.status}`);
              }

              const movies = JSON.parse(response.content);
              // do any custom processing of movies here...

              return movies;
            });
        }
      }
    }
  }
};
```

#### POST and PUT Requests:

To POST or PUT data to your API you can do this:

```javascript
const App = {
  // ...
  triggers: {
    example: {
      // ...
      operation: {
        // ...
        perform: (z, bundle) => {
          const movie = {
            title: 'The Wizard of Oz',
            director: 'Victor Fleming'
          };

          const options = {
            method: 'POST',
            body: JSON.stringify(movie)
          };

          return z.request('http://example.com/api/v2/movies.json', options)
            .then(response => {
              if (response.status !== 201) {
                throw new Error(`Unexpected status code ${response.status}`);
              }
            });
        }
      }
    }
  }
};
```

Note that you need to call `JSON.stringify()` before setting the `body`.

### Using HTTP middleware

If you need to process all HTTP requests in a certain way, you may be able to use one of utility HTTP middleware functions, by putting them in your app definition:

```javascript
const App = {
  // ...
  beforeRequest: [
    (request) => {
      request.headers['my-header'] = 'from zapier';
      return request;
    }
  ],
  afterRequest: [
    (response) => {
      if (response.status !== 200) {
        throw new Error(`Unexpected status code ${response.status}`);
      }
    },
    (response) => {
      response.json = JSON.parse(response.content);
      return response;
    }
  ]
  // ...
```

A `beforeRequest` middleware function takes a request options object, and returns a (possibly mutated) request object. An `afterResponse` middleware function takes a response object, and returns a (possibly mutated) response object. Middleware functions are executed in the order specified in the app definition, and each subsequent middleware receives the request or response object returned by the previous middleware.

Middleware functions can be asynchronous - just return a promise from the middleware function.

### HTTP Request Options

Shorthand requests and manual `z.request()` calls support the following HTTP options:

* `method`: HTTP method, default is `GET`.
* `headers`: request headers object, format `{'header-key': 'header-value'}`.
* `params`: URL query params object, format `{'query-key': 'query-value'}`.
* `body`: request body, can be a string, buffer, or readable stream.
* `redirect`: set to `manual` to extract redirect headers, `error` to reject redirect, default is `follow`.
* `follow`: maximum redirect count, set to `0` to not follow redirects. default is `20`.
* `compress`: support gzip/deflate content encoding. Set to `false` to disable. Default is `true`.
* `agent`: Node.js `http.Agent` instance, allows custom proxy, certificate etc. Default is `null`.
* `timeout`: request / response timeout in ms. Set to `0` to disable (OS limit still applies), timeout reset on `redirect`. Default is `0` (disabled).
* `size`: maximum response body size in bytes. Set to `0`` to disable. Defalut is `0` (disabled).

### HTTP Response Object

The response object returned by `z.request()` supports the following fields and methods:

* `status`: The response status code, i.e. `200`, `404`, etc.
* `content`: The raw response body. For JSON you need to call `JSON.parse(response.content)`.
* `request`: The original request options object (see above).
* `headers`: Response headers object. The header keys are all lower case.
* `getHeader`: Retrieve response header, case insensitive: `response.getHeader('My-Header')`

## Environment

Apps can define environment varialbes that are available when the app's code executes. They work just like environment
variables defined on the command line. They are useful when you have data like an OAuth client ID and secret that you
don't want to commit to source control. Environment variables can also be used as a quick way to toggle between a
a staging and production environment during app development.

It is important to note that **variables are defined on a per-version basis!** When you deploy a new version, the
existing variables from the previous version are copied, so you don't have to manually add them. However, edits
made to one version's environment will not affect the other versions.

### Defining Environment Variables

To define an environment variable, use the `env` command:

```bash
# Will set the environment variable on Zapier.com
zapier env 1.0.0 MY_SECRET_VALUE 1234
```

You will likely also want to set the value locally for testing.

```bash
export MY_SECRET_VALUE=1234
```

### Accessing Environment Variables

To view existing environment variables, use the `env` command.

```bash
# Will print a table listing the variables for this version
zapier env 1.0.0
```

Within your app, you can access the environment in two ways. First, is through the standard Node.js `process.env`

```javascript
const App = {
  // ...
  triggers: {
    example: {
      // ...
      operation: {
        // ...
        perform: (z, bundle) => {
          const httpOptions = {
            headers: {
              'my-header': process.env.MY_SECRET_VALUE
            }
          };
          return z.request('http://example.com/api/v2/records.json', httpOptions);
        }
      }
    }
  }
};
```

The second way to access the environment is through the bundle. This is most useful when combined with the short-hand
syntax for HTTP requests.

```javascript
const App = {
  // ...
  triggers: {
    example: {
      // ...
      operation: {
        // ...
        perform: {
          url: 'http://example.com/api/v2/records.json'
          headers: {
            'my-header': '{{bundle.environment.MY_SECRET_VALUE}}'
          }
        }
      }
    }
  }
};
```
