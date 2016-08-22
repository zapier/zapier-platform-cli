# Introduction

Zapier is a platform for creating integrations and workflows. This CLI is your gateway to creating custom applications on the Zapier platform.


## Getting Started

> The Zapier CLI and Platform requires Node `v4.3.2` or higher, we recommend using [nvm](https://github.com/creationix/nvm) and [homebrew](http://brew.sh/) to manage your Node installation.

First up is installing the CLI and settting up your auth to then create a working "Hello World" application. It will be private to you and visible in your live [Zapier editor](https://zapier.com/app/editor).

```bash
# install the cli globally
npm install -g @zapier/zapier-platform-cli

# print all the commands
zapier help

# setup zapier's auth with your deploy key
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

You should now have a working local app, you can run several local commands to try it out.

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

If you open the editor in Zapier, you should now see "Hello World (1.0.0)" listed and usable! We recommend using our built in watch command to iterate on the app.

```bash
# watch and sync up your local app to zapier
zapier watch

# now make changes locally, and see them reflected live in Zapier
# method calls will also be proxied and logged to stdout for convenience
```

Don't forget you'll need to `zapier deploy` to make your changes stick after any `zapier watch` session!

> Go check out our [full CLI reference documentation](docs/cli.md) to see all the other commands!


## Project Structure

In your `helloworld` folder, you should see this general structure. The `index.js` is your entry point, you'll need to export an `App` definition there.

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

In Zapier's Platform there are two primary resources you'll interact with via the CLI:

* **App** - the base record that defines your App, named like "Joe's CRM". Most people have one of these.
* **Version** - a distinct implementation of an App, named like "1.0.0". Most people have many of these.

If you are wanting to manage your **App**, you'll be using these commands:

* `zapier apps` - list the apps in Zapier you can administer
* `zapier register "Name"` - creates a new app in Zapier
* `zapier link` - lists and links a selected app in Zapier to your current folder
* `zapier history` - print the history of your app

If you are wanting to manage your **Version**, you'll be using these commands:

* `zapier versions` - list the versions for the current directory's app
* `zapier deploy` - deploy the current version the of current directory's app & version (read from `package.json`)
* `zapier promote [1.0.0]` - mark a version as the "production" version
* `zapier migrate [1.0.0] [1.0.1] [100%]` - move users between versions, regardless of deployment status
* `zapier deprecate [1.0.0] [YYYY-MM-DD]` - mark a version as deprecated, but let users continue to use it (we'll email them)
* `zapier env 1.0.0 [KEY] [value]` - set an environment variable to some value

> Note: there is a distinction between your _local_ environment and what is deployed to Zapier - you could have many versions deployed with users on each. Making changes locally never impacts users until you `zapier deploy` (including `zapier watch`). Likewise, pushing one version will not impact other versions - they are completely isolated.


## Authentication

TODO.


## Models

TODO.


## Triggers/Searches/Writes

TODO.


## Making HTTP Requests

To make a manual HTTP request, use the `request` method of the `z` object:

```
perform: (z, bundle) => {
  const customHttpOptions = {
    headers: {
      'X-My-Custom-Header': 'xxx'
    }
  };

  return z.request('http://movies/favorites.json', customHttpOptions)
    .then(response => {
      if (response.status !== 200) {
        throw new z.HaltedError(`Unexpected status code ${response.status}`);
      }
      const movies = JSON.parse(response.content);
      return movies;
    });
}
```

### Using standard HTTP middleware

If you need to process all HTTP requests in a certain way, you may be able to use one of utility HTTP middleware functions, by putting them in your app definition:

```
  beforeRequest: [
    middlewares.applyRequestTemplate({
      headers: {
        'X-My-Custom-Header': 'xxx'
      }
   }
  ],

  afterRequest: [
    middlewares.checkStatusCode,
    middlewares.parseJSON
  ]
```

With that in place, the above request would be simpler:

```
perform: (z, bundle) => {
  return z.request('http://movies/favorites.json')
    .then(response => {
      const movies = response.json;
      return movies;
    });
}
```

### Custom HTTP Middleware

TODO

## Environment

TODO.
