# Zapier Platform CLI

A CLI to test, verify, build and deploy an app to Zapier (both private and public apps).


### Install the Zapier CLI

```bash
# make sure you have node & npm installed
# behind the scenes Zapier uses node v0.10.36
# we recommend using nvm or similar to match!
npm install -g zapier-cli

# setup zapier's auth with your deploy key
zapier auth
```

### Read the Help

```bash
$ zapier help

Usage: zapier COMMAND [command-specific-options]

This Zapier command works off of two files:

 * ~/.zapier-platform      (home directory identifies the deploy key & user)
 * ./.zapier-current-app   (current directory identifies the app)

The `zapier auth` and `zapier create` commands will help manage those files. All commands listed below.

Command    Example                              Documentation
---------  -----------------------------------  --------------------------------------------------------------------------
help       zapier help                          Lists all the commands you can use.
auth       zapier auth                          Configure your ~/.zapier-platform with a deploy key for using the CLI.
create     zapier create "My Example App"       Creates a new app in your account.
link       zapier link                          Link the current directory to an app in your account.
apps       zapier apps                          Lists all the apps in your account.
versions   zapier versions                      Lists all the versions of the current app.
build      zapier build                         Builds a deployable zip from the current directory.
upload     zapier upload                        Upload the last build as a version.
push       zapier push                          Build and upload a new version of the current app - does not deploy.
deploy     zapier deploy 1.0.0                  Deploys a specific version to a production.
migrate    zapier migrate 1.0.0 1.0.1 [10%]     Migrate users from one version to another.
deprecate  zapier deprecate 1.0.0 2018-01-20    Mark a non-production version of your app as deprecated by a certain date.
history    zapier history                       Prints all recent history for your app.
env        zapier env 1.0.0 API_KEY 1234567890  Read and write environment variables.
```

More docs to come!
