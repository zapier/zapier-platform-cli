# Zapier Platform CLI

[![Build Status](https://travis-ci.com/zapier/zapier-platform-cli.svg?token=J7yzswuWzN3zrXDd3zFT&branch=master)](https://travis-ci.org/zapier/zapier-platform-cli)
[![npm version](https://badge.fury.io/js/zapier-platform-cli.svg)](http://badge.fury.io/js/zapier-platform-cli)
[![Dependency Status](https://david-dm.org/zapier/zapier-platform-cli.svg)](https://david-dm.org/zapier/zapier-platform-cli)
[![devDependency Status](https://david-dm.org/zapier/zapier-platform-cli/dev-status.svg)](https://david-dm.org/zapier/zapier-platform-cli#info=devDependencies)

A CLI to test, verify, build and deploy an app to Zapier (both private and public apps).


### Install the Zapier CLI

```bash
# make sure you have node & npm installed
# behind the scenes Zapier uses node v0.10.36
# we recommend using nvm or similar to match!
npm install -g @zapier/zapier-platform-cli

# setup zapier's auth with your deploy key
zapier auth
```

### Read the Help

```bash
$ zapier help
Usage: zapier COMMAND [command-specific-arguments] [--command-specific-options]

┌─────────────┬───────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────┐
│ Command     │ Example                               │ Help                                                                       │
├─────────────┼───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ help        │ zapier help [command]                 │ Lists all the commands you can use.                                        │
│ auth        │ zapier auth                           │ Configure your `/Users/bryanhelmig/.zapierrc` with a deploy key.           │
│ init        │ zapier init [location]                │ Initializes a new zapier app in a directory.                               │
│ register    │ zapier register "Example" [directory] │ Registers a new app in your account.                                       │
│ scaffold    │ zapier scaffold model "Contact"       │ Adds a sample model, trigger, action or search to your app.                │
│ describe    │ zapier describe                       │ Describes the current app.                                                 │
│ watch       │ zapier watch                          │ Watch the current project.                                                 │
│ test        │ zapier test                           │ Tests your app via `npm test`.                                             │
│ link        │ zapier link                           │ Link the current directory to an app you have access to.                   │
│ apps        │ zapier apps                           │ Lists all the apps you can access.                                         │
│ versions    │ zapier versions                       │ Lists all the versions of the current app.                                 │
│ validate    │ zapier validate                       │ Validates the current project.                                             │
│ build       │ zapier build                          │ Builds a deployable zip from the current directory.                        │
│ upload      │ zapier upload                         │ Upload the last build as a version.                                        │
│ push        │ zapier push                           │ Build and upload a new version of the current app - does not deploy.       │
│ deploy      │ zapier deploy 1.0.0                   │ Deploys a specific version to a production.                                │
│ migrate     │ zapier migrate 1.0.0 1.0.1 [10%]      │ Migrate users from one version to another.                                 │
│ deprecate   │ zapier deprecate 1.0.0 2017-01-20     │ Mark a non-production version of your app as deprecated by a certain date. │
│ collaborate │ zapier collaborate [user@example.com] │ Manage the collaborators on your project. Can optionally --remove.         │
│ invite      │ zapier invite [user@example.com]      │ Manage the invitees/testers on your project. Can optionally --remove.      │
│ history     │ zapier history                        │ Prints all recent history for your app.                                    │
│ logs        │ zapier logs                           │ Prints recent logs. See help for filter arguments.                         │
│ env         │ zapier env 1.0.0 API_KEY 1234567890   │ Read and write environment variables.                                      │
└─────────────┴───────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────┘

```

### Releasing a New Version

We've configured the proper `npm version` behavior with pre/post hooks. This simplifies the publishing flow:

```bash
# do not edit package.json, libs, etc. - is automatic!
# be sure to do the same across the other libraries (schema and core)
npm version patch # 1.0.0 -> 1.0.1
npm version minor # 1.0.0 -> 1.1.0
npm version major # 1.0.0 -> 2.0.0
```

## Introduction

Zapier is a platform for creating integrations and workflows. This CLI is your gateway to creating custom applications on the Zapier platform.


## Getting Started

The Zapier CLI requires Node `v4.3.2` or higher, we recommend using [nvm](https://github.com/creationix/nvm) and [homebrew](http://brew.sh/) to manage your Node installation.

After you install, you'll be able to set up your auth and then create a working "Hello World" application. It will be private to you and visible in your live [Zapier editor](https://zapier.com/app/editor).

> Note: have fun!

```bash
# install the cli globally
npm install -g @zapier/zapier-platform-cli

# setup zapier's auth with your deploy key
zapier auth

# create your first app
mkdir helloworld
cd helloworld
zapier create "Hello World" --style=helloworld
```

You can also run tests and validate your app which allows you to verify your code's behavior and that your app definition conforms to our `json-schema`.

```bash
# run the local tests
npm test

# validate the app
zapier validate
```


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


### Sub-header

More to come, ay!