# Zapier Platform CLI

> This is currently pre-release software! You can fill out https://zapier.typeform.com/to/Z4TZBm if you'd like early access.

Zapier is a platform for creating integrations and workflows. This CLI is your gateway to creating custom applications on the Zapier platform.

## Table of Contents

<!-- toc -->
<!-- tocstop -->


## Requirements

The Zapier CLI and Platform require Node.js `v4.3.2`. We recommend using [nvm](https://github.com/creationix/nvm) to manage your Node.js installation.

On Mac (via [homebrew](http://brew.sh/)):

```bash
brew install nvm
nvm install v4.3.2
nvm use v4.3.2
```


## Tutorial

Welcome to the Zapier Platform! In this tutorial, we'll walk you through the process of building, testing, and deploying an app to Zapier.


### Installing the CLI

To get started, first make sure that your dev environment meets the [requirements](#requirements) for running the the platform. Once you have the proper version of Node.js, install the Zapier CLI tool.

```bash
# install the CLI globally
npm install -g zapier-platform-cli
```

The CLI is the primary tool for managing your apps. With it, you can validate and test apps locally, deploy apps so they are available on Zapier, and view logs for debugging. To see a list of all the available commands, try `zapier help`.

Now that your CLI is installed - you'll need to identify yourself via the CLI.

```bash
# auth to Zapier's platform with your deploy key. To obtain a key contact partners@zapier.com
zapier auth
```

Now your CLI is installed and ready to go!


### Starting an App

To begin building an app, use the `init` command to setup the needed structure.

```bash
# create a directory with the minimum required files
zapier init example-app
# move into the new directory
cd example-app
```

Inside the directory, you'll see a few files. `package.json` is a typical requirements file of any Node.js application. It's pre-populated with a few dependencies, most notably the `zapier-platform-core`, which is what makes your app work with the Zapier Platform. There is also an `index.js` file and a test directory (more on those later).

Before we go any further, we need to install the dependencies for our app:

```
npm install
```

### Adding a Trigger

Right next to `package.json` should be `index.js`, which is the entrypoint to your app. This is where the Platform will look for your app definition. Open it up in your editor of choice and let's take a look!

You'll see a few things in `index.js`:

 * we export a single `App` definition which will be interpreted by Zapier
 * in `App` definition, `beforeRequest` & `afterResponse` are hooks into the HTTP client
 * in `App` definition, `triggers` will describe ways to trigger off of data in your app
 * in `App` definition, `searches` will describe ways to find data in your app
 * in `App` definition, `writes` will desciribe ways to create data in your app
 * in `App` definition, `resources` are purely optional but convenient ways to describe CRUD-like objects in your app

Let's start by adding a **trigger.** We will configure it to read data from a mocked API:

```bash
mkdir triggers
touch triggers/recipe.js
```

Open `triggers/recipe.js` and paste this in:

```javascript
const listRecipes = (z, bundle) => {
  const promise = z.request('http://57b20fb546b57d1100a3c405.mockapi.io/api/recipes');
  return promise.then((response) => z.JSON.parse(response.content));
};

module.exports = {
  key: 'recipe',
  noun: 'Recipe',
  display: {
    label: 'New Recipe',
    description: 'Trigger when a new recipe is added.'
  },
  operation: {
    perform: listRecipes
  }
};
```

To break down what is happening in this snippet, look first at the function definition for `listRecipes`. You see that it handles the API work, making the HTTP request and returning a promise that will eventually yield a result. It receives two arguments, a `z` object and a `bundle` object. The [Z Object](#z-object) is a collection of utilities needed when working with APIs. In our snippet, we use `z.request` to make the HTTP call and `z.JSON` to parse the response. The [Bundle Object](#bundle-object) contains any data needed to make API calls, like authentication credentials or data for a POST body. In our snippet, the Bundle is basically an empty object since we don't require any of those to make our GET request.

> Note about Z Object: While it is possible to accomplish the same tasks using alternate Node.js libraries, it's preferable to use the `z` object as there are features built into these utilities that augment the Zapier experience. For example, logging of HTTP calls and better handling of JSON parsing failures. [Read the docs](#z-object) for more info.

Now that we understand our function, take a brief look at the second part of our snippet; the export. Essentially, we export some meta-data plus our `listRecipes` function. We'll explain later how Zapier uses this meta-data. For now, know that it satisifies the minimum info required to define a trigger.

With our trigger defined, we need to incorporate it into our app. Return to `index.js` and add two new lines of code:

1. The `require()` for the trigger at the top of the file
2. The registration of the trigger in `App` by editing the existing `triggers` property

```javascript
const recipe = require('./triggers/recipe'); // new line of code!

// Edit the App definition to register our trigger
const App = {
  // ...
  triggers: {
    [recipe.key]: recipe // new line of code!
  },
  // ...
};
```

Now, let's add a test to make sure our code is working properly. Take a look at `test/index.js` and paste this:

```javascript
require('should');

const zapier = require('zapier-platform-core');

const appTester = zapier.createAppTester(require('../index'));

describe('My App', () => {

  it('should load recipes', (done) => {
    const bundle = {};

    appTester('triggers.recipe', bundle)
      .then(results => {
        results.length.should.above(1);

        const firstRecipe = results[0];
        firstRecipe.name.should.eql('name 1');
        firstRecipe.directions.should.eql('directions 1');

        done();
      })
      .catch(done);
  });

});
```

You should be able to run the tests with `zapier test` and see them pass:

```
zapier test
#
#   triggers
# 200 GET http://57b20fb546b57d1100a3c405.mockapi.io/api/recipes
#     ✓ should load recipes (312ms)
#
#   1 passing (312ms)
#
```

### Modifying a Trigger

Let's say we want to let our users tweak the style of recipes they are triggering on. A classic way to do that with Zapier is to provide an input field a user can fill out.

Re-open your `triggers/recipe.js` and paste this:

```javascript
const listRecipes = (z, bundle) => {
  const promise = z.request('http://57b20fb546b57d1100a3c405.mockapi.io/api/recipes', {
    // NEW CODE
    params: {
      style: bundle.inputData.style
    }
  });
  return promise.then((response) => JSON.parse(response.content));
};

module.exports = {
  key: 'recipe',
  noun: 'Recipe',
  display: {
    label: 'New Recipe',
    description: 'Trigger when a new recipe is added.'
  },
  operation: {
    // NEW CODE
    inputFields: [
      {key: 'style', type: 'string'}
    ],
    perform: listRecipes
  }
};
```

Notice that we include an input field called "style" to our trigger definition. Adding that field means that the bundle can contain data we can use in our GET requests. How the bundle gets its data is a bit complicated, so we'll summarize for now. When developing locally, you can manually supply a bundle in your tests (we will do that below). In production, the data comes from users Zaps. In a Zap, the user fills out a form field called "Style" and whatever value is entered there is what eventually ends up in the bundle.

Since we are developing locally, let's tweak the test to verify everything still works. Re-open `test/index.js` and paste this in:

```javascript
require('should');

const zapier = require('zapier-platform-core');

const appTester = zapier.createAppTester(require('../index'));

describe('triggers', () => {

  it('should load recipes', (done) => {
    const bundle = {
      // NEW CODE
      inputData: {
        style: 'mediterranean'
      }
    };

    appTester('triggers.recipe', bundle)
      .then(results => {
        results.length.should.above(1);

        const firstRecipe = results[0];
        firstRecipe.name.should.eql('name 1');
        firstRecipe.directions.should.eql('directions 1');

        done();
      })
      .catch(done);
  });

});
```

You can run your test again and make sure everything still works:

```
zapier test
#
#   triggers
# 200 GET http://57b20fb546b57d1100a3c405.mockapi.io/api/recipes
#     ✓ should load recipes (312ms)
#
#   1 passing (312ms)
#
```

Looking good locally! Let's move on.

### Deploying an App

So far, everything we have done has been local, on your machine. It's been fun, but we want our app on zapier.com so we can use it with the thousands of other integrations! To do so, we need to take our working local app and deploy it to Zapier.

First, you need to register your app with Zapier. This enables all the admin tooling like deployment, as well as other tooling we'll learn about later including promotion, collaboration, and environment variables.

```bash
zapier register "Example App"
# Registering a new app on Zapier named "Example App"
#
#   Confirming registation of app "Example App" -  done!
#   Linking app to current directory with `.zapierapprc` -  done!
#
# Finished! Now that your app is registered with Zapier, you can `zapier deploy` a version!
```

Next, we have to deploy a version of your app. You can can have many versions of an app, which simplifies making breaking changes and testing in the future. For now, we just need a single version deployed.

```bash
zapier deploy
# Preparing to build and upload your app.
#
#   Copying project to temp directory -  done!
#   Installing project dependencies -  done!
#   Applying entry point file -  done!
#   Validating project -  done!
#   Building app definition.json -  done!
#   Zipping project and dependencies -  done!
#   Cleaning up temp directory -  done!
#   Uploading version 1.0.0 -  done!
#
# Build and upload complete! You should see it in your Zapier editor at https://zapier.com/app/editor now!
```

Now that your app version is properly deployed you can log in and visit [https://zapier.com/app/editor](https://zapier.com/app/editor) to create a Zap using your app!

### Next Steps

Congrats, you've completed the tutorial! At this point we recommend reading up on the [Z Object](#z-object) and [Bundle Object](#bundle-object) to get a better idea of what is possible within the `perform` functions. You can also check out the other [example apps](#example-apps) to see how to incorporate authentication into your app and how to implement things like searches and writes.

## Quickstart

> Be sure to check the [Requirements](#requirements) before you start!

First up is installing the CLI and setting up your auth to create a working "Zapier Example" application. It will be private to you and visible in your live [Zap editor](https://zapier.com/app/editor).

```bash
# install the CLI globally
npm install -g zapier-platform-cli

# auth to Zapier's platform with your deploy key. To obtain a key, email partner@zapier.com
zapier auth
```

Your Zapier CLI should be installed and ready to go at this point. Next up, we'll create our first app!

```bash
# make your folder
mkdir zapier-example
cd zapier-example

# create the needed files from a template
zapier init --template=trigger

# install all the libraries needed for your app
npm install
```

> Note: there are plenty of templates & example apps to choose from! [View all Example Apps here.](#example-apps)

You should now have a working local app. You can run several local commands to try it out.

```bash
# run the local tests
# the same as npm test
zapier test
```

Next, you'll probably want to register your app and upload your version to Zapier itself so you can start testing live.

```bash
# register your app
zapier register "Zapier Example"

# deploy your app version to Zapier
zapier deploy
```

> Go check out our [full CLI reference documentation](docs/cli.md) to see all the other commands!


## Creating a Local App

> Tip: check the [Quickstart](#quickstart) if this is your first time using the platform!

Creating an App can be done entirely locally and they are fairly simple Node.js apps using the standard Node environment and should be completely testable. However, a local app stays local until you `zapier register`.

```bash
# make your folder
mkdir zapier-example
cd zapier-example

# create the needed files from a template
zapier init --template=trigger

# install all the libraries needed for your app
npm install
```

If you'd like to manage your **local App**, use these commands:

* `zapier init --template=resource` - initialize/start a local app project
* `zapier scaffold resource Contact` - auto-injects a new resource, trigger, etc.
* `zapier test` - run the same tests as `npm test`
* `zapier validate` - ensure your app is valid
* `zapier describe` - print some helpful information about your app

### Local Project Structure

In your app's folder, you should see this general recommended structure. The `index.js` is Zapier's entry point to your app. Zapier expects you to export an `App` definition there.

```plain
$ tree .
.
├── README.md
├── index.js
├── package.json
├── triggers
│   └── contact-by-tag.js
├── resources
│   └── Contact.js
├── test
│   ├── basic.js
│   ├── triggers.js
│   └── resources.js
├── build
│   └── build.zip
└── node_modules
    ├── ...
    └── ...
```

### Local App Definition

The core definition of your `App` will look something like this, and is what your `index.js` should provide as the _only_ export:

```javascript
[insert-file:./snippets/app-def.js]
```

> Tip: you can use higher order functions to create any part of your App definition!


## Registering an App

Registering your App with Zapier is a necessary first step which only enables basic administrative functions. It should happen before `zapier deploy` which is to used to actually expose an App Version in the Zapier interface and editor.

```bash
# register your app
zapier register "Zapier Example"

# list your apps
zapier apps
```

> Note: this doesn't put your app in the editor - see the docs on deploying an App Version to do that!

If you'd like to manage your **App**, use these commands:

* `zapier apps` - list the apps in Zapier you can administer
* `zapier register "Name"` - creates a new app in Zapier
* `zapier link` - lists and links a selected app in Zapier to your current folder
* `zapier history` - print the history of your app
* `zapier collaborate [user@example.com]` - add admins to your app who can deploy
* `zapier invite [user@example.com]` - add users to try your app before promotion


## Deploying an App Version

An App Version is related to a specific App but is an "immutable" implementation of your app. This makes it easy to run multiple versions for multiple users concurrently. By default, **every App Version is private** but you can `zapier promote` it to production for use by over 1 million Zapier users.

```bash
# deploy your app version to Zapier
zapier deploy

# list your versions
zapier versions
```

If you'd like to manage your **Version**, use these commands:

* `zapier versions` - list the versions for the current directory's app
* `zapier deploy` - deploy the current version the of current directory's app & version (read from `package.json`)
* `zapier promote [1.0.0]` - mark a version as the "production" version
* `zapier migrate [1.0.0] [1.0.1] [100%]` - move users between versions, regardless of deployment status
* `zapier deprecate [1.0.0] [YYYY-MM-DD]` - mark a version as deprecated, but let users continue to use it (we'll email them)
* `zapier env 1.0.0 [KEY] [value]` - set an environment variable to some value


### Private App Version (default)

A simple `zapier deploy` will only create the App Version in your editor. No one else using Zapier can see it or use it.


### Sharing an App Version

This is how you would share your app with friends, co-workers or clients. This is perfect for quality assurance, testing with active users or just sharing any app you like.

```bash
# sends an email this user to let them view the app in the ui privately
zapier invite user@example.com

# sends an email this user to let being an admin of the app
zapier collaborate user@example.com
```


### Promoting an App Version

Promotion is how you would share your app with every one of the 1 million+ Zapier users. If this is your first time promoting - you may have to wait for the Zapier team to review and approve your app.

If this isn't the first time you've promoted your app - you might have users on older versions. You can `zapier migrate` to either move users over (which can be dangerous if you have breaking changes). Or, you can `zapier deprecate` to give users some time to move over themselves.

```bash
# promote your app version to all Zapier users
zapier promote 1.0.1

# OPTIONAL - migrate your users between one app version to another
zapier migrate 1.0.0 1.0.1

# OR - mark the old version as deprecated
zapier deprecate 1.0.0 2017-01-01
```


## Authentication

Most applications require some sort of authentication - and Zapier provides a handful of methods for helping your users authenticate with your application. Zapier will provide some of the core behaviors, but you'll likely need to handle the rest.

> Hint: You can access the data tied to your authentication via the `bundle.authData` property in any method called in your app.

### Basic

Useful if your app requires two pieces of information to authentication: `username` and `password` which only the end user can provide. By default, Zapier will do the standard Basic authentication base64 header encoding for you (via an automatically registered middleware).

> Note: if you do the common API Key pattern like `Authorization: Basic APIKEYHERE:x` you should look at the "Custom" authentication method instead.

```javascript
[insert-file:./snippets/basic-auth.js]
```

### Custom

This is what most "API Key" driven apps should default to using. You'll likely provide some some custom `beforeRequest` middleware or a `requestTemplate` to complete the authentication by adding/computing needed headers.

```javascript
[insert-file:./snippets/custom-auth.js]
```

### Digest

Very similar to the "Basic" authentication method above, but uses digest authentication instead of Basic authentication.

```javascript
[insert-file:./snippets/digest-auth.js]
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
[insert-file:./snippets/oauth2.js]
```

## Resources

A `resource` is a representation (as a JavaScript object) of one of the REST resources of your API. Say you have a `/recipes`
endpoint for working with recipes; you can define a recipe resource in your app that will tell Zapier how to do create,
read, and search operations on that resource.

```javascript
[insert-file:./snippets/resources.js]
```

The quickest way to create a resource is with the `zapier scaffold` command:

```bash
zapier scaffold resource "Recipe"
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
[insert-file:./snippets/recipe-list.js]
```

The method is made up of two properties, a `display` and an `operation`. The `display` property ([schema](https://github.com/zapier/zapier-platform-schema/blob/master/docs/build/schema.md#basicdisplayschema)) holds the info needed to present the method as an available Trigger in the Zapier Editor. The `operation` ([schema](https://github.com/zapier/zapier-platform-schema/blob/master/docs/build/schema.md#resourceschema)) provides the implementation to make the API call.

Adding a create method looks very similar.

```javascript
[insert-file:./snippets/recipe-create.js]
```

Every method you define on a `resource` Zapier converts to the appropriate Trigger, Write, or Search. Our examples
above would result in an app with a New Recipe Trigger and an Add Recipe Write.


## Triggers/Searches/Writes

Triggers, Searches, and Writes are the way an app defines what it is able to do. Triggers read
data into Zapier (i.e. watch for new recipes). Searches locate individual records (find recipe by title). Writes create
new records in your system (add a recipe to the catalog).

The definition for each of these follows the same structure. Here is an example of a trigger:

```javascript
[insert-file:./snippets/trigger.js]
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
[insert-file:./snippets/shorthand-request.js]
```

In the url above, `{{bundle.authData.subdomain}}` is automatically replaced with the live value from the bundle. If the call returns a non 2xx return code, an error is automatically raised. The response body is automatically parsed as JSON and returned.

An error will be raised if the response is not valid JSON, so _do not use shorthand HTTP requests with non-JSON responses_.

### Manual HTTP Requests

When you need to do custom processing of the response, or need to process non-JSON responses, you can make manual HTTP requests. This approach does not perform any magic - no status code checking, no automatic JSON parsing. Use this method when you need more control. Manual requests do perform lazy `{{curly}}` replacement.

To make a manual HTTP request, use the `request` method of the `z` object:

```javascript
[insert-file:./snippets/manual-request.js]
```

#### POST and PUT Requests

To POST or PUT data to your API you can do this:

```javascript
[insert-file:./snippets/put.js]
```

Note that you need to call `JSON.stringify()` before setting the `body`.

### Using HTTP middleware

If you need to process all HTTP requests in a certain way, you may be able to use one of utility HTTP middleware functions, by putting them in your app definition:

```javascript
[insert-file:./snippets/middleware.js]
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
* `headers`: Response headers object. The header keys are all lower case.
* `getHeader`: Retrieve response header, case insensitive: `response.getHeader('My-Header')`
* `options`: The original request options object (see above).

## Z Object

We provide several methods off of the `z` object, which is provided as the first argument to all function calls in your app.

* `request`: An HTTP client with some Zapier-specific goodies. See [Making HTTP Requests](#making-http-requests).
* `console`: Logging console, similar to Node.js `console` but logs remotely, as well as to stdout in tests. See [Log Sttatements](#console-log-statements)
* `JSON`: Similar to the JSON built-in, but catches errors and produces nicer tracebacks.
* `hash`: Crypto tool for doing things like `z.hash('sha256', 'my password')`
* `errors`: Error classes that you can throw in your code, like `throw new z.errors.HaltedError('...')`
* `dehydrate`: Dehydrate a function
* `dehydrateRequest`: Dehydrate a request
* `dehydrateFile`: Dehydrate a file

## Bundle Object

This object holds the user's auth details and the data to for the API requests.

* `authData` - user-provided authentication data, like `api_key` or `access_token`. [(Read more on authentication)[#authentication]]
* `inputData` - user-provided data for this particular run of the trigger/search/write, as defined by the inputFields. For example:
```javascript
{
  createdBy: 'Bobby Flay'
  style: 'mediterranean'
}
```
* `inputDataRaw` - like `inputData`, but before rendering `{{curlies}}`.
```javascript
{
  createdBy: '{{chef_name}}'
  style: '{{style}}'
}
```

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

Within your app, you can access the environment via the standard `process.env` - any values set via local `export` or `zapier env` will be there.

For example, you can access the `process.env` in your perform functions:

```javascript
[insert-file:./snippets/process-env.js]
```

## Logging

There are two types of logs for a Zapier app, console logs and HTTP logs. The console logs are created by your app through the use of the `z.console` method ([see below for details](#console-log-statements)). The HTTP logs are created automatically by Zapier whenever your app makes HTTP requests (as long as you use `z.request()` or shorthand request objects).

### Console Log Statements

To manually print a log statement in your code, use `z.console`:

```javascript
  z.console.log('Here are the input fields', bundle.inputData);
```

The `z.console` object has all the same methods and works just like the Node.js [`Console`](https://nodejs.org/dist/latest-v4.x/docs/api/console.html) class - the only difference is we'll log to our distrubuted datastore and you can view them via `zapier logs` (more below).

### Viewing Logs

To view the logs for your application, use the `zapier logs` command. There are two types of logs, `http` (logged automatically by Zapier on HTTP requests) and `console` (manual logs via `z.console.log()` statements). To see the HTTP logs do:

```
zapier logs --type=http
```
To see detailed http logs including headers, request and response bodies, etc, do:

```
zapier logs --type=http --detailed
```

To see your `z.console` logs do:

```
zapier logs --type=console
```

For more advanced logging options including only displaying the logs for a certain user or app version, look at the help for the logs command:

```
zapier help logs
```

## Testing

You can write unit tests for your Zapier app that run locally, outside of the zapier editor.
You can run these tests in a CI tool like [Travis](https://travis-ci.com/).

### Writing Unit Tests

We recommend using the [Mocha](https://mochajs.org/) testing framework. After running
`zapier init` you should find an example test to start from in the `test` directory.

To

```javascript
[insert-file:./snippets/mocha-test.js]
```

### Running Unit Tests

To run all your tests do:

```
zapier test
```

### Viewing HTTP Logs in Unit Tests

When running a unit test via `zapier test`, `z.console` statements print to `stdout`. To see the HTTP logs when running tests do:

```
zapier test --log-to-stdout
```

To also see the detailed HTTP logs do:

```
zapier test --log-to-stdout --detailed-log-to-stdout
```

## Example Apps

Check out the following example applications to help you get started:

* [Resource Example](https://github.com/zapier/zapier-platform-example-app-resource) - `zapier init --template=resource`
* [Trigger Example](https://github.com/zapier/zapier-platform-example-app-trigger) - `zapier init --template=trigger`
* [Search Example](https://github.com/zapier/zapier-platform-example-app-search) - `zapier init --template=search`
* [Write Example](https://github.com/zapier/zapier-platform-example-app-write) - `zapier init --template=write`
* [Middleware Example](https://github.com/zapier/zapier-platform-example-app-middleware) - `zapier init --template=middleware`
* [Basic Auth Example](https://github.com/zapier/zapier-platform-example-app-basic-auth) - `zapier init --template=basic-auth`
* [Custom Auth Example](https://github.com/zapier/zapier-platform-example-app-custom-auth) - `zapier init --template=custom-auth`
* [OAuth2 Example](https://github.com/zapier/zapier-platform-example-app-oauth2) - `zapier init --template=oauth2`
