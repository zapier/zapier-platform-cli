<h1 align="center">
  <a href="https://zapier.com"><img src="https://cdn.rawgit.com/zapier/zapier-platform-cli/master/goodies/zapier-logomark.png" alt="Zapier" width="200"></a>
  <br>
  Zapier Platform CLI
  <br>
  <br>
</h1>

<p align="center">
  <a href="https://travis-ci.org/zapier/zapier-platform-cli"><img src="https://img.shields.io/travis/zapier/zapier-platform-cli/master.svg" alt="Travis"></a>
  <a href="https://www.npmjs.com/package/zapier-platform-cli"><img src="https://img.shields.io/npm/v/zapier-platform-cli.svg" alt="npm version"></a>
  <!--possible downloads badge too, once that's good-->
</p>

Zapier is a platform for creating integrations and workflows. This CLI is your gateway to creating custom applications on the Zapier platform.

[These docs are available here](http://zapier.github.io/zapier-platform-cli/), the [CLI docs are available here](http://zapier.github.io/zapier-platform-cli/cli.html), and you can [view all the schema definitions here](https://zapier.github.io/zapier-platform-schema/build/schema.html).

## Table of Contents

<!-- toc -->
<!-- tocstop -->


## Getting Started

> If you're new to Zapier Platform CLI, we strongly recommend you to walk through the [Tutorial](https://zapier.com/developer/start) for a more thorough introduction.

### What is an App?

A CLI App is an implementation of your app's API. You build a Node.js application
that exports a single object ([JSON Schema](https://zapier.github.io/zapier-platform-schema/build/schema.html#appschema)) and upload it to Zapier.
Zapier introspects that definition to find out what your app is capable of and
what options to present end users in the Zap Editor.

For those not familiar with Zapier terminology, here is how concepts in the CLI
map to the end user experience:

 * [Authentication](#authentication), (usually) which lets us know what credentials to ask users
   for. This is used during the "Connect Accounts" section of the Zap Editor.
 * [Triggers](#triggerssearchescreates), which read data *from* your API. These have their own section in the Zap Editor.
 * [Creates](#triggerssearchescreates), which send data *to* your API to create new records. These are listed under "Actions" in the Zap Editor.
 * [Searches](#triggerssearchescreates), which find specific records *in* your system. These are also listed under "Actions" in the Zap Editor.
 * [Resources](#resources), which define an object type in your API (say a contact) and the operations available to perform on it. These are automatically extracted into Triggers, Searches, and Creates.

### How does the CLI Platform Work

Zapier takes the App you upload and sends it over to Amazon Web Service's Lambda.
We then make calls to execute the operations your App defines as we execute Zaps.
Your App takes the input data we provide (if any), makes the necessary HTTP calls,
and returns the relevant data, which gets fed back into Zapier.

### CLI vs the Web Builder Platform

From a user perspective, both the CLI and the existing web builder platform offer the same experience. The biggest difference is how they're developed. The CLI takes a much more code-first approach, allowing you to develop your Zapier app just like you would any other programming project. The web builder, on the other hand, is much better for folks who want to make an app with minimal coding involved. Both will continue to coexist, so pick whichever fits your needs best!

### Requirements

All Zapier CLI apps are run using Node.js `LAMBDA_VERSION`.

You can develop using any version of Node you'd like, but your eventual code must be compatible with `LAMBDA_VERSION`. If you're using features not yet available in `LAMBDA_VERSION`, you can transpile your code to a compatible format with [Babel](https://babeljs.io/) (or similar).

To ensure stability for our users, we strongly encourage you run tests on `LAMBDA_VERSION` sometime before your code reaches users. This can be done multiple ways.

Firstly, by using a CI tool (like [Travis CI](https://travis-ci.org/) or [Circle CI](https://circleci.com/), which are free for open source projects). We provide a sample [.travis.yml](https://github.com/zapier/zapier-platform-example-app-minimal/blob/master/.travis.yml) file in our template apps to get you started.

Alternatively, you can change your local node version with tools such as [nvm](https://github.com/creationix/nvm#installation) or [n](https://github.com/tj/n#installation).
Then you can either swap to that version with `nvm use LAMBDA_VERSION`, or do `nvm exec LAMBDA_VERSION zapier test` so you can run tests without having to switch versions while developing.


### Quick Setup Guide

First up is installing the CLI and setting up your auth to create a working "Zapier Example" application. It will be private to you and visible in your live [Zap editor](https://zapier.com/app/editor).

```bash
# install the CLI globally
npm install -g zapier-platform-cli

# setup auth to Zapier's platform with a deploy key
zapier login
```

Your Zapier CLI should be installed and ready to go at this point. Next up, we'll create our first app!

```bash
# create a directory with the minimum required files
zapier init example-app

# move into the new directory
cd example-app

# install all the libraries needed for your app
npm install
```

> Note: there are plenty of templates & example apps to choose from! [View all Example Apps here.](#example-apps)

You should now have a working local app. You can run several local commands to try it out.

```bash
# run the local tests
# the same as npm test, but adds some extra things to the environment
zapier test
```

Next, you'll probably want to upload app to Zapier itself so you can start testing live.

```bash
# push your app to Zapier
zapier push
```

> Go check out our [full CLI reference documentation](http://zapier.github.io/zapier-platform-cli/cli.html) to see all the other commands!


### Tutorial

For a full tutorial, head over to our [Tutorial](https://zapier.com/developer/start) for a comprehensive walkthrough for creating your first app. If this isn't your first rodeo, read on!

## Creating a Local App

> Tip: check the [Quick Setup](#quick-setup-guide) if this is your first time using the platform!

Creating an App can be done entirely locally and they are fairly simple Node.js apps using the standard Node environment and should be completely testable. However, a local app stays local until you `zapier register`.

```bash
# make your folder
mkdir zapier-example
cd zapier-example

# create the needed files from a template
zapier init . --template=trigger

# install all the libraries needed for your app
npm install
```

If you'd like to manage your **local App**, use these commands:

* `zapier init . --template=resource` - initialize/start a local app project ([see templates here](https://github.com/zapier/zapier-platform-cli/wiki/Example-Apps))
* `zapier convert 1234 .` - initialize/start from an existing app (alpha)
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

```js
[insert-file:./snippets/app-def.js]
```

> Tip: you can use higher order functions to create any part of your App definition!


## Registering an App

Registering your App with Zapier is a necessary first step which only enables basic administrative functions. It should happen before `zapier push` which is to used to actually expose an App Version in the Zapier interface and editor.

```bash
# register your app
zapier register "Zapier Example"

# list your apps
zapier apps
```

> Note: this doesn't put your app in the editor - see the docs on pushing an App Version to do that!

If you'd like to manage your **App**, use these commands:

* `zapier apps` - list the apps in Zapier you can administer
* `zapier register "Name"` - creates a new app in Zapier
* `zapier link` - lists and links a selected app in Zapier to your current folder
* `zapier history` - print the history of your app
* `zapier collaborate [user@example.com]` - add admins to your app who can push
* `zapier invite [user@example.com] [1.0.0]` - add users to try your app version 1.0.0 before promotion


## Deploying an App Version

An App Version is related to a specific App but is an "immutable" implementation of your app. This makes it easy to run multiple versions for multiple users concurrently. By default, **every App Version is private** but you can `zapier promote` it to production for use by over 1 million Zapier users.

```bash
# push your app version to Zapier
zapier push

# list your versions
zapier versions
```

If you'd like to manage your **Version**, use these commands:

* `zapier versions` - list the versions for the current directory's app
* `zapier push` - push the current version of current directory's app & version (read from `package.json`)
* `zapier promote [1.0.0]` - mark a version as the "production" version
* `zapier migrate [1.0.0] [1.0.1] [100%]` - move users between versions, regardless of deployment status
* `zapier deprecate [1.0.0] [YYYY-MM-DD]` - mark a version as deprecated, but let users continue to use it (we'll email them)
* `zapier env 1.0.0 [KEY] [value]` - set an environment variable to some value

> Note: To see the changes that were just pushed reflected in the browser, you have to manually refresh the browser each time you push.


### Private App Version (default)

A simple `zapier push` will only create the App Version in your editor. No one else using Zapier can see it or use it.


### Sharing an App Version

This is how you would share your app with friends, co-workers or clients. This is perfect for quality assurance, testing with active users or just sharing any app you like.

```bash
# sends an email this user to let them view the app version 1.0.0 in the UI privately
zapier invite user@example.com 1.0.0

# sends an email this user to let them admin the app (make changes just like you)
zapier collaborate user@example.com
```

You can also invite anyone on the internet to your app by observing the URL at the bottom of `zapier invite`, it should look something like `https://zapier.com/platform/public-invite/1/222dcd03aed943a8676dc80e2427a40d/`. You can put this in your help docs, post it to Twitter, add it to your email campaign, etc. Note this will invite users to every app version.


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

## Converting an Existing App

If you have an existing Web Builder app on [Zapier Developer Platform](https://zapier.com/developer/builder/) you can use it as a template to kickstart your local application.

```bash
# Convert an existing Web Builder app to a CLI app in the my-app directory
# App ID 1234 is from URL https://zapier.com/developer/builder/app/1234/development
zapier convert 1234 my-app
```

Your CLI app will be created and you can continue working on it.

> Since v3.3.0, `zapier convert` has been improved a lot. But this is still in an alpha state - you'll likely have to edit the code to make it work.

> Note - there is no way to convert a CLI app to a Web Builder app and we do not plan on implementing this.

## Authentication

Most applications require some sort of authentication - and Zapier provides a handful of methods for helping your users authenticate with your application. Zapier will provide some of the core behaviors, but you'll likely need to handle the rest.

> Hint: You can access the data tied to your authentication via the `bundle.authData` property in any method called in your app. Exceptions exist in OAuth and Session auth. Please see them below.

### Basic

Useful if your app requires two pieces of information to authentication: `username` and `password` which only the end user can provide. By default, Zapier will do the standard Basic authentication base64 header encoding for you (via an automatically registered middleware).

> Example App: check out https://github.com/zapier/zapier-platform-example-app-basic-auth for a working example app for basic auth.

> Note: if you do the common API Key pattern like `Authorization: Basic APIKEYHERE:x` you should look at the "Custom" authentication method instead.

```js
[insert-file:./snippets/basic-auth.js]
```

### Custom

This is what most "API Key" driven apps should default to using. You'll likely provide some custom `beforeRequest` middleware or a `requestTemplate` to complete the authentication by adding/computing needed headers.

> Example App: check out https://github.com/zapier/zapier-platform-example-app-custom-auth for a working example app for custom auth.

```js
[insert-file:./snippets/custom-auth.js]
```

### Session

Probably the most "powerful" mechanism for authentication - it gives you the ability to exchange some user provided data for some authentication data (IE: username & password for a session key).

> Example App: check out https://github.com/zapier/zapier-platform-example-app-session-auth for a working example app for session auth.

```js
[insert-file:./snippets/session-auth.js]
```

> Note - For Session auth, `authentication.sessionConfig.perform` will have the provided fields in `bundle.inputData` instead of `bundle.authData` because `bundle.authData` will only have "previously existing" values, which will be empty the first time the Zap runs.

### OAuth2

Zapier's OAuth2 implementation is based on the `authorization_code` flow, similar to [GitHub](http://developer.github.com/v3/oauth/) and [Facebook](https://developers.facebook.com/docs/authentication/server-side/).

> Example App: check out https://github.com/zapier/zapier-platform-example-app-oauth2 for a working example app for oauth2.

It looks like this:

  1. Zapier sends the user to the authorization URL defined by your App
  2. Once authorized, your website sends the user to the `redirect_uri` Zapier provided (`zapier describe` to find out what it is)
  3. Zapier makes a call on the backend to your API to exchange the `code` for an `access_token`
  4. Zapier remembers the `access_token` and makes calls on behalf of the user
  5. (Optionally) Zapier can refresh the token if it expires

You are required to define the authorization URL and the API call to fetch the access token. You'll also likely want to set your `CLIENT_ID` and `CLIENT_SECRET` as environment variables:

```bash
# setting the environment variables on Zapier.com
$ zapier env 1.0.0 CLIENT_ID 1234
$ zapier env 1.0.0 CLIENT_SECRET abcd

# and when running tests locally, don't forget to define them!
$ CLIENT_ID=1234 CLIENT_SECRET=abcd zapier test
```

Your auth definition would look something like this:

```js
[insert-file:./snippets/oauth2.js]
```

> Note - For OAuth, `authentication.oauth2Config.authorizeUrl`, `authentication.oauth2Config.getAccessToken`, and `authentication.oauth2Config.refreshAccessToken`  will have the provided fields in `bundle.inputData` instead of `bundle.authData` because `bundle.authData` will only have "previously existing" values, which will be empty the first time the Zap runs. Also note that `authentication.oauth2Config.getAccessToken` has access to the users return values in `rawRequest` and `cleanedRequest` should you need to extract other values (for example from the query string)


## Resources

A `resource` is a representation (as a JavaScript object) of one of the REST resources of your API. Say you have a `/recipes`
endpoint for working with recipes; you can define a recipe resource in your app that will tell Zapier how to do create,
read, and search operations on that resource.

```js
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

> Example App: check out https://github.com/zapier/zapier-platform-example-app-resource for a working example app using resources.

After those, there is a set of optional properties that tell Zapier what methods can be performed on the resource.
The complete list of available methods can be found in the [Resource Schema Docs](https://zapier.github.io/zapier-platform-schema/build/schema.html#resourceschema).
For now, let's focus on two:

 * `list` - Tells Zapier how to fetch a set of this resource. This becomes a Trigger in the Zapier Editor.
 * `create` - Tells Zapier how to create a new instance of the resource. This becomes an Action in the Zapier Editor.

Here is a complete example of what the list method might look like

```js
[insert-file:./snippets/recipe-list.js]
```

The method is made up of two properties, a `display` and an `operation`. The `display` property ([schema](https://zapier.github.io/zapier-platform-schema/build/schema.html#basicdisplayschema)) holds the info needed to present the method as an available Trigger in the Zapier Editor. The `operation` ([schema](https://zapier.github.io/zapier-platform-schema/build/schema.html#resourceschema)) provides the implementation to make the API call.

Adding a create method looks very similar.

```js
[insert-file:./snippets/recipe-create.js]
```

Every method you define on a `resource` Zapier converts to the appropriate Trigger, Create, or Search. Our examples
above would result in an app with a New Recipe Trigger and an Add Recipe Create.

Note the keys for the Trigger, Create, Search, and Search or Create are automatically generated (in case you want to use them in a dynamic dropdown), like: `{resourceName}List`, `{resourceName}Create`, `{resourceName}Search`, and `{resourceName}SearchOrCreate`; in the examples above, `{resourceName}` would be `recipe`.


## Triggers/Searches/Creates

Triggers, Searches, and Creates are the way an app defines what it is able to do. Triggers read
data into Zapier (i.e. watch for new recipes). Searches locate individual records (find recipe by title). Creates create
new records in your system (add a recipe to the catalog).

The definition for each of these follows the same structure. Here is an example of a trigger:

```js
[insert-file:./snippets/trigger.js]
```

You can find more details on the definition for each by looking at the [Trigger Schema](https://zapier.github.io/zapier-platform-schema/build/schema.html#triggerschema),
[Search Schema](https://zapier.github.io/zapier-platform-schema/build/schema.html#searchschema), and [Create Schema](https://zapier.github.io/zapier-platform-schema/build/schema.html#createschema).

> Example App: check out https://github.com/zapier/zapier-platform-example-app-trigger for a working example app using triggers.

> Example App: check out https://github.com/zapier/zapier-platform-example-app-rest-hooks for a working example app using REST hook triggers.

> Example App: check out https://github.com/zapier/zapier-platform-example-app-search for a working example app using searches.

> Example App: check out https://github.com/zapier/zapier-platform-example-app-create for a working example app using creates.

### Return Types

Each of the 3 types of function expects a certain type of object. As of core `v1.0.11`, there are automated checks to let you know when you're trying to pass the wrong type back. There's more info in each relevant `post_X` section of the [v2 docs](https://zapier.com/developer/documentation/v2/scripting/#available-methods). For reference, each expects:

| Method | Return Type | Notes |
| --- | --- | --- |
| Trigger | Array | 0 or more objects that will be passed to the [deduper](https://zapier.com/developer/documentation/v2/deduplication/) |
| Search | Array | 0 or more objects. If len > 0, put the best match first |
| Action | Object | Return values are evaluated by [`isPlainObject`](https://lodash.com/docs#isPlainObject) |

## Input Fields

On each trigger, search, or create in the `operation` directive - you can provide an array of objects as fields under the `inputFields`. Input Fields are what your users would see in the main Zapier user interface. For example, you might have a "create contact" action with fields like "First name", "Last name", "Email", etc.

You can find more details on each and every field option at [Field Schema](https://zapier.github.io/zapier-platform-schema/build/schema.html#fieldschema).

Those fields have various options you can provide, here is a succinct example:

```js
[insert-file:./snippets/fields.js]
```

### Custom/Dynamic Fields

In some cases, it might be necessary to provide fields that are dynamically generated - especially for custom fields. This is a common pattern for CRMs, form software, databases and more. Basically - you can provide a function instead of a field and we'll evaluate that function - merging the dynamic fields with the static fields.

> You should see `bundle.inputData` partially filled in as users provide data - even in field retrieval. This allows you to build hierarchical relationships into fields (EG: only show issues from the previously selected project).

> A function that returns a list of dynamic fields cannot include additional functions in that list to call for dynamic fields.

```js
[insert-file:./snippets/custom-fields.js]
```

Additionally, if there is a field that affects the generation of dynamic fields, you can set the `altersDynamicFields: true` property. This informs the Zapier UI that whenever the value of that field changes, fields need to be recomputed. An example could be a static dropdown of "dessert type" that will change whether the function that generates dynamic fields includes a field "with sprinkles."

```js
[insert-file:./snippets/alters-dynamic-fields.js]
```

> Only dropdowns support `altersDynamicFields`.

### Dynamic Dropdowns

Sometimes, API endpoints require clients to specify a parent object in order to create or access the child resources. Imagine having to specify a company id in order to get a list of employees for that company. Since people don't speak in auto-incremented ID's, it is necessary that Zapier offer a simple way to select that parent using human readable handles.

Our solution is to present users a dropdown that is populated by making a live API call to fetch a list of parent objects. We call these special dropdowns "dynamic dropdowns."

To define one, you can provide the `dynamic` property on your field to specify the trigger that should be used to populate the options for the dropdown. The value for the property is a dot-separated concatenation of a trigger's key, the field to use for the value, and the field to use for the label.

```js
[insert-file:./snippets/dynamic-dropdowns.js]
```

In the UI, users will see something like this:

![screenshot of dynamic dropdown in Zap Editor](https://cdn.zapier.com/storage/photos/dd31fa761e0cf9d0abc9b50438f95210.png)

> Dynamic dropdowns are one of the few fields that automatically invalidate Zapier's field cache, so it is not necessary to set `altersDynamicFields` to true for these fields.

### Search-Powered Fields

For fields that take id of another object to create a relationship between the two (EG: a project id for a ticket), you can specify the `search` property on the field to indicate that Zapier needs to prompt the user to setup a Search step to populate the value for this field. Similar to dynamic dropdowns, the value for this property is a dot-separated concatenation of a search's key and the field to use for the value.

```js
[insert-file:./snippets/search-field.js]
```

**NOTE:** This has to be combined with the `dynamic` property to give the user a guided experience when setting up a Zap.

If you don't define a trigger for the `dynamic` property, the search connector won't show.

### Computed Fields

In OAuth and Session Auth, you might want to store fields in `bundle.authData` (other than `access_token`, `refresh_token` — for OAuth —, or `sessionKey` — for Session Auth), that you don't want the user to fill in.

For those situations, you need a computed field. It's just like another field, but with a `computed: true` property (don't forget to also make it `required: false`). You can see examples in the [OAuth](#oauth2) or [Session Auth](#session) example sections.

## Output Fields

On each trigger, search, or create in the operation directive - you can provide an array of objects as fields under the `outputFields`. Output Fields are what your users would see when they select a field provided by your trigger, search or create to map it to another.

Output Fields are optional, but can be used to:

- Define friendly labels for the returned fields. By default, we will *humanize* for example `my_key` as *My Key*.
- Mark certain fields as `important` to sort them higher in the list of available fields to map.
- Make sure that custom fields that may not be found in every live sample and - since they're custom to the connected account - cannot be defined in the static sample, can still be mapped.

The [schema](https://zapier.github.io/zapier-platform-schema/build/schema.html#fieldschema) for `outputFields` is shared with `inputFields` but only the `key`, `required` and `important` properties are relevant.

Custom/Dynamic Output Fields are defined in the same way as [Custom/Dynamic Input Fields](#customdynamic-fields).

### Nested & Children (Line Item) Fields

To define an Output Field for a nested field use `{{parent}}__{{key}}`. For children (line item) fields use `{{parent}}[]{{key}}`.

```js
[insert-file:./snippets/output-fields.js]
```

## Z Object

We provide several methods off of the `z` object, which is provided as the first argument to all function calls in your app.

> The `z` object is passed into your functions as the first argument - IE: `perform: (z) => {}`.

### `z.request([url], options)`

`z.request([url], options)` is a promise based HTTP client with some Zapier-specific goodies. See [Making HTTP Requests](#making-http-requests).

### `z.console`

`z.console.log(message)` is a logging console, similar to Node.js `console` but logs remotely, as well as to stdout in tests. See [Log Statements](#console-logging)

### `z.dehydrate(func, inputData)`

`z.dehydrate(func, inputData)` is used to lazily evaluate a function, perfect to avoid API calls during polling or for reuse. See [Dehydration](#dehydration).

### `z.stashFile(bufferStringStream, [knownLength], [filename], [contentType])`

`z.stashFile(bufferStringStream, [knownLength], [filename], [contentType])` is a promise based file stasher that returns a URL file pointer. See [Stashing Files](#stashing-files).

### `z.JSON`

`z.JSON` is similar to the JSON built-in like `z.JSON.parse('...')`, but catches errors and produces nicer tracebacks.

### `z.hash()`

`z.hash()` is a crypto tool for doing things like `z.hash('sha256', 'my password')`

### `z.errors`

`z.errors` is a collection error classes that you can throw in your code, like `throw new z.errors.HaltedError('...')`.

The available errors are:

* HaltedError - Stops current operation, but will never turn off Zap. Read more on [Halting Execution](#halting-execution)
* ExpiredAuthError - Turns off Zap and emails user to manually reconnect. Read more on [Stale Authentication Credentials](#stale-authentication-credentials)
* RefreshAuthError - (OAuth2 or Session Auth) Tells Zapier to refresh credentials and retry operation. Read more on [Stale Authentication Credentials](#stale-authentication-credentials)


For more details on error handling in general, see [here](#error-handling).

### `z.cursor`

The `z.cursor` object exposes two methods:

* `z.cursor.get(): Promise<string|null>`
* `z.cursor.set(string): Promise<null>`

Any data you `set` will be available to that Zap for about an hour (or until it's overwritten). For more information, see: [paging](#paging).

## Bundle Object

This object holds the user's auth details and the data for the API requests.

> The `bundle` object is passed into your functions as the second argument - IE: `perform: (z, bundle) => {}`.

### `bundle.authData`

`bundle.authData` is user-provided authentication data, like `api_key` or `access_token`. [Read more on authentication.](#authentication)

### `bundle.inputData`

`bundle.inputData` is user-provided data for this particular run of the trigger/search/create, as defined by the inputFields. For example:

```js
{
  createdBy: 'his name is Bobby Flay'
  style: 'he cooks mediterranean'
}
```

### `bundle.inputDataRaw`

`bundle.inputDataRaw` is kind of like `inputData`, but before rendering `{{curlies}}`:

```js
{
  createdBy: 'his name is {{123__chef_name}}'
  style: 'he cooks {{456__style}}'
}
```

> "curlies" are data mapped in from previous steps. They take the form `{{NODE_ID__key_name}}`. You'll usually want to use `bundle.inputData` instead.

### `bundle.meta`

`bundle.meta` is extra information useful for doing advanced behaviors depending on what the user is doing. It has the following options:

| key | default | description |
| --- | --- | --- |
| frontend | `false` | if true, this run was initiated manually via the Zap editor |
| prefill | `false` | if true, this poll is being used to populate a dynamic dropdown |
| hydrate | `true`  | if true, the results of this run will be hydrated (false if we're in the middle of hydrating already) |
| test_poll | `false` | if true, the poll was triggered by a user testing their account (via [clicking "test"](https://cdn.zapier.com/storage/photos/5c94c304ce11b02c073a973466a7b846.png) on the auth |
| standard_poll| `true`  | the opposite of `test_poll` |
| first_poll | `false` | if true, the results of this poll will be used to initialize the deduplication list rather than trigger a zap. See: [deduplication](#dedup) |
| limit | `-1` | the number of items to fetch. `-1` indicates there's no limit (which will almost always be the case) |
| page | `0` | used in [paging](#paging) to uniquely identify which page of results should be returned |

> `bundle.meta.zap.id` is only available in the `performSubscribe` and `performUnsubscribe` methods

The user's Zap ID is available during the [subscribe and unsubscribe](https://zapier.github.io/zapier-platform-schema/build/schema.html#basichookoperationschema) methods.

For example - you could do:

```js
const subscribeHook = (z, bundle) => {

  const options = {
    url: 'http://57b20fb546b57d1100a3c405.mockapi.io/api/hooks',
    method: 'POST',
    body: {
      url: bundle.targetUrl, // bundle.targetUrl has the Hook URL this app should call
      zap_id: bundle.meta.zap.id,
    },
  };

  return z.request(options).then((response) => response.json);
};

module.exports = {
  // ... see our rest hook example for additional details: https://github.com/zapier/zapier-platform-example-app-rest-hooks/blob/master/triggers/recipe.js
  performSubscribe: subscribeHook,
  // ...
};
```

### `bundle.rawRequest`
> `bundle.rawRequest` is only available in the `perform` for web hooks and `getAccessToken` for oauth authentication methods

`bundle.rawRequest` holds raw information about the HTTP request that triggered the `perform` method or that represents the users browser request that triggered the `getAccessToken` call:

```
{
  method: 'POST',
  querystring: 'foo=bar&baz=qux',
  headers: {
    'Content-Type': 'application/json'
  },
  content: '{"hello": "world"}'
}
```



### `bundle.cleanedRequest`
> `bundle.cleanedRequest` is only available in the `perform` for web hooks and `getAccessToken` for oauth authentication methods

`bundle.cleanedRequest` will return a formatted and parsed version of the request. Some or all of the following will be available:

```
{
  method: 'POST',
  querystring: {
    foo: 'bar',
    baz: 'qux'
  },
  headers: {
    'Content-Type': 'application/json'
  },
  content: {
    hello: 'world'
  }
}
```


## Environment

Apps can define environment variables that are available when the app's code executes. They work just like environment
variables defined on the command line. They are useful when you have data like an OAuth client ID and secret that you
don't want to commit to source control. Environment variables can also be used as a quick way to toggle between a
a staging and production environment during app development.

It is important to note that **variables are defined on a per-version basis!** When you push a new version, the
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

Alternatively, we provide some extra tooling to work with an `.env` (or `.environment`, see below note) that looks like this:

```
MY_SECRET_VALUE=1234
```

> `.env` is the new recommended name for the environment file since v5.1.0. The old name `.environment` is depreated but will continue to work for backward compatibility.

And then in your `test/basic.js` file:

```js
const zapier = require('zapier-platform-core');

should('some tests', () => {
  zapier.tools.env.inject(); // testing only!
  console.log(process.env.MY_SECRET_VALUE);
  // should print '1234'
});
```

> This is a popular way to provide `process.env.ACCESS_TOKEN || bundle.authData.access_token` for convenient testing.

> **NOTE** Variables defined via `zapier env` will _always_ be uppercased. For example, you would access the variable defined by `zapier env 1.0.0 foo_bar 1234` with `process.env.FOO_BAR`.


### Accessing Environment Variables

To view existing environment variables, use the `env` command.

```bash
# Will print a table listing the variables for this version
zapier env 1.0.0
```

Within your app, you can access the environment via the standard `process.env` - any values set via local `export` or `zapier env` will be there.

For example, you can access the `process.env` in your perform functions and in templates:

```js
[insert-file:./snippets/process-env.js]
```

> Note! Be sure to lazily access your environment variables - see [When to use placeholders or curlies?](#when-to-use-placeholders-or-curlies)


## Making HTTP Requests

There are two primary ways to make HTTP requests in the Zapier platform:

1. **Shorthand HTTP Requests** - these are simple object literals that make it easy to define simple requests.
2. **Manual HTTP Requests** - you use `z.request([url], options)` to make the requests and control the response. Use this when you need to change options for certain requests (for all requests, use middleware).

There are also a few helper constructs you can use to reduce boilerplate:

1. `requestTemplate` which is an shorthand HTTP request that will be merged with every request.
2. `beforeRequest` middleware which is an array of functions to mutate a request before it is sent.
3. `afterResponse` middleware which is an array of functions to mutate a response before it is completed.

> Note: you can install any HTTP client you like - but this is greatly discouraged as you lose [automatic HTTP logging](#http-logging) and middleware.

### Shorthand HTTP Requests

For simple HTTP requests that do not require special pre or post processing, you can specify the HTTP options as an object literal in your app definition.

This features:

1. Lazy `{{curly}}` replacement.
2. JSON de-serialization.
3. Automatic non-2xx error raising.

```js
[insert-file:./snippets/shorthand-request.js]
```

In the url above, `{{bundle.authData.subdomain}}` is automatically replaced with the live value from the bundle. If the call returns a non 2xx return code, an error is automatically raised. The response body is automatically parsed as JSON and returned.

An error will be raised if the response is not valid JSON, so _do not use shorthand HTTP requests with non-JSON responses_.

### Manual HTTP Requests

When you need to do custom processing of the response, or need to process non-JSON responses, you can make manual HTTP requests. This approach does not perform any magic - no status code checking, no automatic JSON parsing. Use this method when you need more control. Manual requests do perform lazy `{{curly}}` replacement.

To make a manual HTTP request, use the `request` method of the `z` object:

```js
[insert-file:./snippets/manual-request.js]
```

#### POST and PUT Requests

To POST or PUT data to your API you can do this:

```js
[insert-file:./snippets/put.js]
```

> Note: you need to call `z.JSON.stringify()` before setting the `body`.

### Using HTTP middleware

If you need to process all HTTP requests in a certain way, you may be able to use one of utility HTTP middleware functions.

> Example App: check out https://github.com/zapier/zapier-platform-example-app-middleware for a working example app using HTTP middleware.

Try putting them in your app definition:

```js
[insert-file:./snippets/middleware.js]
```

A `beforeRequest` middleware function takes a request options object, and returns a (possibly mutated) request object. An `afterResponse` middleware function takes a response object, and returns a (possibly mutated) response object. Middleware functions are executed in the order specified in the app definition, and each subsequent middleware receives the request or response object returned by the previous middleware.

Middleware functions can be asynchronous - just return a promise from the middleware function.

The second argument for middleware is the `z` object, but it does *not* include `z.request()` as using that would easily create infinite loops.

### HTTP Request Options

Shorthand requests and manual `z.request([url], options)` calls support the following HTTP `options`:

* `url`: HTTP url, you can provide it both `z.request(url, options)` or `z.request({url: url, ...})`.
* `method`: HTTP method, default is `GET`.
* `headers`: request headers object, format `{'header-key': 'header-value'}`.
* `params`: URL query params object, format `{'query-key': 'query-value'}`.
* `body`: request body, can be a string, buffer, readable stream or plain object. When it is an object/array and the `Content-Type` header is `application/x-www-form-urlencoded` the body will be transformed to query string parameters, otherwise we'll set the header to `application/json; charset=utf-8` and JSON encode the body. Default is `null`.
* `json`: shortcut object/array/etc. you want to JSON encode into body. Default is `null`.
* `form`: shortcut object. you want to form encode into body. Default is `null`.
* `raw`: set this to stream the response instead of consuming it immediately. Default is `false`.
* `redirect`: set to `manual` to extract redirect headers, `error` to reject redirect, default is `follow`.
* `follow`: maximum redirect count, set to `0` to not follow redirects. default is `20`.
* `compress`: support gzip/deflate content encoding. Set to `false` to disable. Default is `true`.
* `agent`: Node.js `http.Agent` instance, allows custom proxy, certificate etc. Default is `null`.
* `timeout`: request / response timeout in ms. Set to `0` to disable (OS limit still applies), timeout reset on `redirect`. Default is `0` (disabled).
* `size`: maximum response body size in bytes. Set to `0` to disable. Default is `0` (disabled).

```js
z.request({
  url: 'http://example.com',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  // only provide body, json or form...
  body: {hello: 'world'}, // or '{"hello": "world"}' or 'hello=world'
  json: {hello: 'world'},
  form: {hello: 'world'},
  // access node-fetch style response.body
  raw: false,
  redirect: 'follow',
  follow: 20,
  compress: true,
  agent: null,
  timeout: 0,
  size: 0,
})
```

### HTTP Response Object

The response object returned by `z.request([url], options)` supports the following fields and methods:

* `status`: The response status code, i.e. `200`, `404`, etc.
* `content`: The response content as a String. For Buffer, try `options.raw = true`.
* `json`: The response content as an object (or `undefined`). If `options.raw = true` - is a promise.
* `body`: A stream available only if you provide `options.raw = true`.
* `headers`: Response headers object. The header keys are all lower case.
* `getHeader(key)`: Retrieve response header, case insensitive: `response.getHeader('My-Header')`
* `throwForStatus()`: Throw error if final `response.status > 300`. Will throw `z.error.RefreshAuthError` if 401.
* `request`: The original request options object (see above).

```js
z.request({
  // ..
}).then((response) => {
  // a bunch of examples lines for cherry picking
  response.status;
  response.headers['Content-Type'];
  response.getHeader('content-type');
  response.request; // original request options
  response.throwForStatus();
  // if options.raw === false (default)...
  JSON.parse(response.content);
  response.json;
  // if options.raw === true...
  response.buffer().then(buf => buf.toString());
  response.text().then(content => content);
  response.json().then(json => json);
  response.body.pipe(otherStream);
});
```


## Dehydration

Dehydration, and its counterpart Hydration, is a tool that can lazily load data that might be otherwise expensive to retrieve aggressively.

* **Dehydration** - think of this as "make a pointer", you control the creation of pointers with `z.dehydrate(func, inputData)`
* **Hydration** - think of this as an automatic step that "consumes a pointer" and "returns some data", Zapier does this automatically behind the scenes

> This is very common when [Stashing Files](#stashing-files) - but that isn't their only use!

The method `z.dehydrate(func, inputData)` has two required arguments:

* `func` - the function to call to fetch the extra data. Can be any raw `function`, defined in the file doing the dehydration or imported from another part of your app. You must also register the function in the app's `hydrators` property
* `inputData` - this is an object that contains things like a `path` or `id` - whatever you need to load data on the other side

> **Why do I need to register my functions?** Because of how Javascript works with its module system, we need an explicit handle on the function that can be accessed from the App definition without trying to "automagically" (and sometimes incorrectly) infer code locations.

Here is an example that pulls in extra data for a movie:

```js
[insert-file:./snippets/dehydration.js]
```

And in future steps of the Zap - if Zapier encounters a pointer as returned by `z.dehydrate(func, inputData)` - Zapier will tie it back to your app and pull in the data lazily.

> **Why can't I just load the data immediately?** Isn't it easier? In some cases it can be - but imagine an API that returns 100 records when polling - doing 100x `GET /id.json` aggressive inline HTTP calls when 99% of the time Zapier doesn't _need_ the data yet is wasteful.


## Stashing Files

It can be expensive to download and stream files or they can require complex handshakes to authorize downloads - so we provide a helpful stash routine that will take any `String`, `Buffer` or `Stream` and return a URL file pointer suitable for returning from triggers, searches, creates, etc.

The interface `z.stashFile(bufferStringStream, [knownLength], [filename], [contentType])` takes a single required argument - the extra three arguments will be automatically populated in most cases. For example - a full example is this:

```js
const content = 'Hello world!';
z.stashFile(content, content.length, 'hello.txt', 'text/plain')
  .then(url => z.console.log(url));
// https://zapier-dev-files.s3.amazonaws.com/cli-platform/f75e2819-05e2-41d0-b70e-9f8272f9eebf
```

Most likely you'd want to stream from another URL - note the usage of `z.request({raw: true})`:

```js
const fileRequest = z.request({url: 'http://example.com/file.pdf', raw: true});
z.stashFile(fileRequest) // knownLength and filename will be sniffed from the request. contentType will be binary/octet-stream
  .then(url => z.console.log(url));
// https://zapier-dev-files.s3.amazonaws.com/cli-platform/74bc623c-d94d-4cac-81f1-f71d7d517bc7
```

> Note: you should only be using `z.stashFile()` in a hydration method - otherwise it can be very expensive to stash dozens of files in a polling call - for example!

See a full example with dehydration/hydration wired in correctly:

```js
[insert-file:./snippets/stash-file.js]
```

> Example App: check out https://github.com/zapier/zapier-platform-example-app-files for a working example app using files.


## Logging

There are two types of logs for a Zapier app, console logs and HTTP logs. The console logs are created by your app through the use of the `z.console.log` method ([see below for details](#console-logging)). The HTTP logs are created automatically by Zapier whenever your app makes HTTP requests (as long as you use `z.request([url], options)` or shorthand request objects).

To view the logs for your application, use the `zapier logs` command. There are three types of logs, `http` (logged automatically by Zapier on HTTP requests), `bundle` (logged automatically on every method execution), and `console` (manual logs via `z.console.log()` statements).

For advanced logging options including only displaying the logs for a certain user or app version, look at the help for the logs command:

```bash
zapier help logs
```

### Console Logging

To manually print a log statement in your code, use `z.console.log`:

```js
z.console.log('Here are the input fields', bundle.inputData);
```

The `z.console` object has all the same methods and works just like the Node.js [`Console`](https://nodejs.org/docs/latest-v6.x/api/console.html) class - the only difference is we'll log to our distributed datastore and you can view them via `zapier logs` (more below).

### Viewing Console Logs

To see your `z.console.log` logs, do:

```bash
zapier logs --type=console
```

### Viewing Bundle Logs

To see the bundle logs, do:

```bash
zapier logs --type=bundle
```

### HTTP Logging

If you are using the `z.request()` shortcut that we provide - HTTP logging is handled automatically for you. For example:

```js
z.request('http://57b20fb546b57d1100a3c405.mockapi.io/api/recipes')
  .then((res) => {
    // do whatever you like, this request is already getting logged! :-D
    return res;
  })
```

### Viewing HTTP Logs

To see the HTTP logs, do:

```bash
zapier logs --type=http
```
To see detailed http logs including headers, request and response bodies, etc, do:

```bash
zapier logs --type=http --detailed
```


## Error Handling

APIs are not always available. Users do not always input data correctly to
formulate valid requests. Thus, it is a good idea to write apps defensively and
plan for 4xx and 5xx responses from APIs. Without proper handling, errors often
have incomprehensible messages for end users, or possibly go uncaught.

Zapier provides a couple tools to help with error handling. First is the `afterResponse`
middleware ([docs](#using-http-middleware)), which provides a hook for processing
all responses from HTTP calls. The other tool is the collection of errors in
`z.errors` ([docs](#zerrors)), which control the behavior of Zaps when
various kinds of errors occur.

### General Errors

Errors due to a misconfiguration in a user's Zap should be handled in your app
by throwing a standard JavaScript `Error` with a user-friendly message.
Typically, this will be prettifying 4xx responses or APIs that return errors as
200s with a payload that describes the error.

Example: `throw new Error('Your error message.');`

A couple best practices to keep in mind:

  * Elaborate on terse messages. "not_authenticated" -> "Your API Key is invalid. Please reconnect your account."
  * If the error calls out a specific field, surface that information to the user. "Invalid Request" -> "contact name is invalid"
  * If the error provides details about why a field is invalid, add that in too! "contact name is invalid" -> "contact name is too long"

Note that if a Zap raises too many error messages it will be automatically
turned off, so only use these if the scenario is truly an error that needs to
be fixed.

### Halting Execution

Any operation can be interrupted or "halted" (not success, not error, but
stopped for some specific reason) with a `HaltedError`. You might find yourself
using this error in cases where a required pre-condition is not met. For instance,
in a create to add an email address to a list where duplicates are not allowed,
you would want to throw a `HaltedError` if the Zap attempted to add a duplicate.
This would indicate failure, but it would be treated as a soft failure.

Unlike throwing `Error`, a Zap will never by turned off when this error is thrown
(even if it is raised more often than not).

Example: `throw new z.errors.HaltedError('Your reason.');`

### Stale Authentication Credentials

For apps that require manual refresh of authorization on a regular basis, Zapier
provides a mechanism to notify users of expired credentials. With the
`ExpiredAuthError`, the current operation is interrupted, the Zap is turned off
(to prevent more calls with expired credentials), and a predefined email is sent
out informing the user to refresh the credentials.

Example: `throw new z.errors.ExpiredAuthError('Your message.');`

For apps that use OAuth2 + refresh or Session Auth, you can use the
`RefreshAuthError`. This will signal Zapier to refresh the credentials and then
repeat the failed operation.

Example: `throw new z.errors.RefreshAuthError();`


## Testing

You can write unit tests for your Zapier app that run locally, outside of the zapier editor.
You can run these tests in a CI tool like [Travis](https://travis-ci.com/).

### Writing Unit Tests

We recommend using the [Mocha](https://mochajs.org/) testing framework. After running
`zapier init` you should find an example test to start from in the `test` directory.

```js
[insert-file:./snippets/mocha-test.js]
```

### Mocking Requests

While testing, it's useful to test your code without actually hitting any external services. [Nock](https://github.com/node-nock/nock) is a node.js utility that intercepts requests before they ever leave your computer. You can specify a response code, body, headers, and more. It works out of the box with `z.request` by setting up your `nock` before calling `appTester`.

```js
[insert-file:./snippets/mocha-mocked-test.js]
```

There's more info about nock and its usage in its [readme](https://github.com/node-nock/nock/blob/master/README.md).

### Running Unit Tests

To run all your tests do:

```bash
zapier test
```

> You can also go direct with `npm test` or `node_modules/mocha/bin/mocha`.

### Testing & Environment Variables

The best way to store sensitive values (like API keys, OAuth secrets, or passwords) is in an `.env` (or `.environment`, see below note) file ([learn more](https://github.com/motdotla/dotenv#faq)). Then, you can include the following before your tests run:

```js
const zapier = require('zapier-platform-core');
zapier.tools.env.inject(); // inject() can take a filename; defaults to ".env"

// now process.env has all the values in your .env file
```

> `.env` is the new recommended name for the environment file since v5.1.0. The old name `.environment` is depreated but will continue to work for backward compatibility.

> Remember: **NEVER** add your secrets file to version control!

Additionally, you can provide them dynamically at runtime:

```bash
CLIENT_ID=1234 CLIENT_SECRET=abcd zapier test
```

Or, `export` them explicitly and place them into the environment:

```bash
export CLIENT_ID=1234
export CLIENT_SECRET=abcd
zapier test
```


### Viewing HTTP Logs in Unit Tests


When running a unit test via `zapier test`, `z.console` statements and detailed HTTP logs print to `stdout`:

```bash
zapier test
```

Sometimes you don't want that much logging, for example in a CI test. To suppress the detailed HTTP logs do:

```bash
zapier test --quiet
```

To also suppress the HTTP summary logs do:

```bash
zapier test --very-quiet
```

### Testing in Your CI

Whether you use Travis, Circle, Jenkins, or anything else, we aim to make it painless to test in an automated environment.

Behind the scenes `zapier test` is doing a pretty standard `npm test` with [mocha](https://www.npmjs.com/package/mocha) as the backend.

This makes it pretty straightforward to integrate into your testing interface. If you'd like to test with [Travis CI](https://travis-ci.com/) for example - the `.travis.yml` would look something like this:

```yaml
language: node_js
node_js:
  - "LAMBDA_VERSION"
before_script: npm install -g zapier-platform-cli
script: CLIENT_ID=1234 CLIENT_SECRET=abcd zapier test
```

You can substitute `zapier test` with `npm test`, or a direct call to `node_modules/mocha/bin/mocha`. Also, we generally recommend putting the environment variables into whatever configuration screen Jenkins or Travis provides!

As an alternative to reading the deploy key from root (the default location), you may set the `ZAPIER_DEPLOY_KEY` environment variable to run privileged commands without the human input needed for `zapier login`. We suggest encrypting your deploy key in whatever manner you CI provides (such as [these instructions](https://docs.travis-ci.com/user/environment-variables/#Defining-encrypted-variables-in-.travis.yml), for Travis).


## Using `npm` Modules

Use `npm` modules just like you would use them in any other node app, for example:

```bash
npm install --save jwt
```

And then `package.json` will be updated, and you can use them like anything else:

```js
const jwt = require('jwt');
```

During the `zapier build` or `zapier push` step - we'll copy all your code to `/tmp` folder and do a fresh re-install of modules.

> Note: If your package isn't being pushed correctly (IE: you get "Error: Cannot find module 'whatever'" in production), try adding the `--disable-dependency-detection` flag to `zapier push`.

> Note 2: You can also try adding a "includeInBuild" array property (with paths to include, which will be evaluated to RegExp, with a case insensitive flag) to your `.zapierapprc` file, to make it look like:

```json
{
  "id": 1,
  "key": "App1",
  "includeInBuild": [
    "test.txt",
    "testing.json"
  ]
}

```

> Warning: do not use compiled libraries unless you run your build on the AWS AMI `ami-6869aa05`.


## Using Transpilers

We do not yet support transpilers out of the box, but if you would like to use `babel` or similar, we recommend creating a custom wrapper on `zapier push` like this in your `package.json`:

```json
{
  "scripts": {
    "zapier-dev": "babel src --out-dir lib --watch",
    "zapier-push": "babel src --out-dir lib && zapier push"
  }
}
```

And then you can have your fancy ES7 code in `src/*` and a root `index.js` like this:

```js
module.exports = require('./lib');
```

And work with commands like this:

```bash
# watch and recompile
npm run zapier-dev

# tests should work fine
zapier test

# every build ensures a fresh build
npm run zapier-push
```

There are a lot of details left out - check out the full example app for a working setup.

> Example App: check out https://github.com/zapier/zapier-platform-example-app-babel for a working example app using Babel.

## Example Apps

See [the wiki](https://github.com/zapier/zapier-platform-cli/wiki/Example-Apps) for a full list of working examples (and installation instructions).

## FAQs

### Why doesn't Zapier support newer versions of Node.js?

We run your code on AWS Lambda, which only supports a few [versions](https://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html) of Node (the latest of which is `LAMBDA_VERSION`. As that updates, so too will we.

### How do I manually set the Node.js version to run my app with?

Update your `zapier-platform-core` dependency in `package.json`.  Each major version ties to a specific version of Node.js. You can find the mapping [here](https://github.com/zapier/zapier-platform-cli/blob/master/src/version-store.js). We only support the version(s) supported by [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html).

### When to use placeholders or curlies?

You will see both [template literal placeholders](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Expression_interpolation) `${var}` and (double) "curlies" `{{var}}` used in examples.

In general, use `${var}` within functions and use `{{var}}` anywhere else.

Placeholders get evaluated as soon as the line of code is evaluated. This means that if you use `${process.env.VAR}` in a trigger configuration, `zapier push` will substitute it with your local environment's value for `VAR` when it builds your app and the value set via `zapier env` will not be used.

> If you're not familiar with [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), know that `const val = "a" + b + "c"` is essentially the same as <code>const val = &#96;a${b}c&#96;</code>.

### Does Zapier support XML (SOAP) APIs?

Not natively, but it can! Users have reported that the following `npm` modules are compatible with the CLI Platform:

* [pixl-xml](https://github.com/jhuckaby/pixl-xml)
* [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js)
* [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)

```js
[insert-file:./snippets/xml.js]
```

### Is it possible to iterate over pages in a polling trigger?

Yes, though there are caveats. Your entire function only gets 30 seconds to run. HTTP requests are costly, so paging through a list may time out (which you should avoid at all costs).

```js
[insert-file:./snippets/paging-poll.js]
```

If you need to do more requests conditionally based on the results of an HTTP call (such as the "next url" param or similar value), using `async/await` (as shown in the example below) is a good way to go. If you go this route, only page as far as you need to. Keep an eye on the polling [guidelines](https://zapier.com/developer/documentation/v2/deduplication/), namely the part about only iterating until you hit items that have probably been seen in a previous poll.

```js
[insert-file:./snippets/async-polling.js]
```

### How do search-powered fields relate to dynamic dropdowns and why are they both required together?

To understand search-powered fields, we have to have a good understanding of dynamic dropdowns.

When users are selecting specific resources (for instance, a Google Sheet), it's important they're able to select the exact sheet they want. Instead of referencing the sheet by name (which may change), we match via `id` instead. Rather than directing the user copy and paste an id for every item they might encounter, there is the notion of a **dynamic dropdown**. A dropdown is a trigger that returns a list of resources. It can pull double duty and use its results to power another trigger, search, or action in the same app.  It provides a list of ids with labels that show the item's name:

![](https://cdn.zapier.com/storage/photos/fb56bdc2aab91504be0e51800bec4d64.png)

The field's value reaches your app as an id. You define this connection with the `dynamic` property, which is a string: `trigger_key.id_key.label_key`. This approach works great if the user setting up the Zap always wants the Zap to use the same spreadsheet. They specify the id during setup and the Zap runs happily.

**Search fields** take this connection a step further. Rather than set the spreadsheet id at setup, the user could precede the action with a search field to make the id dynamic. For instance, let's say you have a different spreadsheet for every day of the week. You could build the following zap:

1. Some Trigger
2. Calculate what day of the week it is today (Code)
3. Find the spreadsheet that matches the day from Step 2
4. Update the spreadsheet (with the id from step 3) with some data

If the connection between steps 3 and 4 is a common one, you can indicate that in your field by specifying `search` as a `search_key.id_key`. When paired **with a dynamic dropdown**, this will add a button to the editor that will add the search step to the user's Zap and map the id field correctly.

![](https://cdn.zapier.com/storage/photos/d263fd3a56cf8108cb89195163e7c9aa.png)

This is paired most often with "update" actions, where a required parameter will be a resource id.

<a id="paging"></a>
### What's the deal with pagination? When is it used and how does it work?

Paging is **only used when a trigger is part of a dynamic dropdown**. Depending on how many items exist and how many are returned in the first poll, it's possible that the resource the user is looking for isn't in the initial poll. If they hit the "see more" button, we'll increment the value of `bundle.meta.page` and poll again.

Paging is a lot like a regular trigger except the range of items returned is dynamic. The most common example of this is when you can pass a `offset` parameter:

```js
(z, bundle) => {
  const promise = z.request({
    url: 'http://example.com/api/list.json',
    params: {
      limit: 100,
      offset: 100 * bundle.meta.page
    }
  });
  return promise.then((response) => response.json);
};
```

If your API uses cursor-based paging instead of an offset, you can use `z.cursor.get` and `z.cursor.set`:

```js
[insert-file:./snippets/paging-cursor.js]
```

Cursors are stored per-zap and last about an hour. Per the above, make sure to only include the cursor if `bundle.meta.page !== 0`, so you don't accidentally reuse a cursor from a previous poll.

Lastly, you need to set `canPaginate` to `true` in your polling definition (per the [schema](https://github.com/zapier/zapier-platform-schema/blob/master/docs/build/schema.md#basicpollingoperationschema)) for the `z.cursor` methods to work as expected.

<a id="dedup"></a>
### How does deduplication work?

Each time a polling Zap runs, Zapier needs to decide which of the items in the response should trigger the zap. To do this, we compare the `id`s to all those we've seen before, trigger on new objects, and update the list of seen `id`s. When a Zap is turned on, we initialize the list of seen `id`s with a single poll. When it's turned off, we clear that list. For this reason, it's important that calls to a polling endpoint always return the newest items.

For example, the initial poll returns objects 4, 5, and 6 (where a higher `id` is newer). If a later poll increases the limit and returns objects 1-6, then 1, 2, and 3 will be (incorrectly) treated like new objects.

There's a more in-depth explanation [here](https://zapier.com/developer/documentation/v2/deduplication/).

### Why are my triggers complaining if I don't provide an explicit `id` field? I didn't have to do that in the Web Builder!

For deduplication to work, we need to be able to identify and use a unique field. For WB apps, we guessed if `id` wasn't present. In order to ensure we don't guess wrong, we now require that the developers send us an `id` field. If your objects have a differently-named unique field, feel free to adapt this snippet and ensure this test passes:

```js
// ...
let items = z.JSON.parse(response.content).items;
items.forEach(item => {
  item.id = item.contactId;
})

return items;
```

## Command Line Tab Completion

We have provided two tab completion scripts to make it easier to use the Zapier Platform CLI, for zsh and bash.

### Zsh Completion Script

To use the zsh completion script, first setup support for completion, if you haven't already done so. This example assumes your completion scripts are in `~/.zsh/completion`. Adjust accordingly if you put them somewhere else:

```zsh
# add custom completion scripts
fpath=(~/.zsh/completion $fpath)

# compsys initialization
autoload -U compinit
compinit
```

Next download our completion script to your completions directory:

```zsh
cd ~/.zsh/completion
curl https://raw.githubusercontent.com/zapier/zapier-platform-cli/master/goodies/zsh/_zapier -O
```

Finally, restart your shell and start hitting TAB with the `zapier` command!

### Bash Completion Script

To use the bash completion script, first download the completion script. The example assumes your completion scripts are in `~/.bash_completion.d` directory. Adjust accordingly if you put them somewhere else.

```bash
cd ~/.bash_completion.d
curl https://raw.githubusercontent.com/zapier/zapier-platform-cli/master/goodies/bash/_zapier -O
```

Next source the script from your `~/.bash_profile`:

```bash
source ~/.bash_completion.d/_zapier
```

Finally, restart your shell and start hitting TAB with the `zapier` command!

## The Zapier Platform Packages

The Zapier Platform consists of 3 npm packages that are released simultaneously as a trio.

- [`zapier-platform-cli`](https://github.com/zapier/zapier-platform-cli) is the code that powers the `zapier` command. You use it most commonly with the `test`, `scaffold`, and `push` commands. It's installed with `npm install -g zapier-platform-cli` and does not correspond to a particular app.

- [`zapier-platform-core`](https://github.com/zapier/zapier-platform-core) is what allows your app to interact with Zapier. It holds the `z` object and app tester code. Your app depends on a specific version of `zapier-platform-core` in the `package.json` file. It's installed via `npm install` along with the rest of your app's dependencies.

- [`zapier-platform-schema`](https://github.com/zapier/zapier-platform-schema) enforces app structure behind the scenes. It's a dependency of `core`, so it will be installed automatically.

### Updating

The Zapier platform and its tools are under active development. While you don't need to install every release, we release new versions because they are better than the last. We do our best to adhere to [Semantic Versioning](https://semver.org/) wherein we won't break your code unless there's a `major` release. Otherwise, we're just fixing bugs (`patch`) and adding features (`minor`).

Barring unforseen circumstances, all released platform versions will continue to work for the forseeable future. While you never *have* to upgrade your app's `platform-core` dependency, we recommend keeping an eye on the [changelog](https://github.com/zapier/zapier-platform-cli/blob/master/CHANGELOG.md) to see what new features and bux fixes are available.

<!-- TODO: if we decouple releases, change this -->
The most recently released version of `cli` and `core` is `PACKAGE_VERSION`. You can see the versions you're working with by running `zapier -v`.

To update `cli`, run `npm install -g zapier-platform-cli`.

To update the version of `core` your app depends on, set the `zapier-platform-core` dependency in your `package.json` to a version listed [here](https://github.com/zapier/zapier-platform-core/releases) and run `npm install`.

For maximum compatibility, keep the versions of `cli` and `core` in sync.

## Development of the CLI

This section is only relevant if you're editing the `zapier-platform-cli` package itself.

### Commands

- `export ZAPIER_BASE_ENDPOINT='http://localhost:8001'` if you're building against a local dev environment
- `npm install` for getting started
- `npm run build` for updating `./lib` from `./src`
- `npm test` for running tests (also runs `npm run build`)
- `npm run test-convert` for running integration tests for the `zapier convert` command
- `npm run docs` for updating docs
- `npm run gen-completions` for updating the auto complete scripts

### Publishing of the CLI (after merging)

- `npm version [patch|minor|major]` will pull, test, update docs, increment version in package.json, push tags, and publish to npm
- `npm run validate-templates` for validating the example apps
- `npm run set-template-versions VERSION` for updating the platform-core version in the example app repos to `VERSION`

## Get Help!

You can get help by either emailing partners@zapier.com or by joining our Slack channel https://zapier-platform-slack.herokuapp.com.
