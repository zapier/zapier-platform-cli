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

This Zapier command works off of two files:

 * ~/.zapier-platform-auth      (home directory identifies the deploy key & user)
 * ./.zapier-platform-current-app   (current directory identifies the app)

The `zapier auth` and `zapier create`/`zapier link` commands will help manage those files. All commands listed below.

┌───────────────┬─────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────┐
│ Command       │ Example                                 │ Documentation                                                                           │
├───────────────┼─────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────┤
│ help          │ zapier help                             │ Lists all the commands you can use.                                                     │
│ auth          │ zapier auth                             │ Configure your ~/.zapier-platform-auth with a deploy key for using the CLI.             │
│ create        │ zapier create "My Example App"          │ Creates a new app in your account.                                                      │
│ link          │ zapier link                             │ Link the current directory to an app in your account.                                   │
│ apps          │ zapier apps                             │ Lists all the apps in your account.                                                     │
│ versions      │ zapier versions                         │ Lists all the versions of the current app.                                              │
│ validate      │ zapier validate                         │ Validates the current project.                                                          │
│ build         │ zapier build                            │ Builds a deployable zip from the current directory.                                     │
│ upload        │ zapier upload                           │ Upload the last build as a version.                                                     │
│ push          │ zapier push                             │ Build and upload a new version of the current app - does not deploy.                    │
│ deploy        │ zapier deploy 1.0.0                     │ Deploys a specific version to a production.                                             │
│ migrate       │ zapier migrate 1.0.0 1.0.1 [10%]        │ Migrate users from one version to another.                                              │
│ deprecate     │ zapier deprecate 1.0.0 2018-01-20       │ Mark a non-production version of your app as deprecated by a certain date.              │
│ collaborators │ zapier collaborators [john@example.com] │ Manage the collaborators on your project. Can optionally --delete.                      │
│ invitees      │ zapier invitees [john@example.com]      │ Manage the invitees/testers on your project.                                            │
│ history       │ zapier history                          │ Prints all recent history for your app.                                                 │
│ logs          │ zapier logs --version=1.0.1             │ Prints recent logs. Can filter --{error|success} --{http|console} --user=you@person.com │
│ env           │ zapier env 1.0.0 API_KEY 1234567890     │ Read and write environment variables.                                                   │
└───────────────┴─────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────┘

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
