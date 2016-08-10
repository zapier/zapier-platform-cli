# Zapier CLI Reference

These are the generated docs for all Zapier platform CLI commands.

You can install the CLI with `npm`.

```bash
$ npm install -g @zapier/zapier-platform-cli
```

# Commands

## help

> Lists all the commands you can use.

**Usage:** `zapier help [command]`

Prints documentation to the terminal screen.

```bash
$ zapier help
$ zapier help apps
$ zapier help scaffold
```


## auth

> Configure your `~/.zapierrc` with a deploy key for using the CLI.

**Usage:** `zapier auth`

This is an interactive prompt which will set up your account deploy keys and credentials.

```bash
$ zapier auth
# What is your Deploy Key from https://zapier.com/platform/? (Ctl-C to cancel)
#  <type here>
# Your deploy key has been saved to ~/.zapierrc.
```


## create

> Creates a new app in your account.

**Usage:** `zapier create "My Example App"`

A handy command that will perform a bunch of steps for you:

* Clone an working example Github repository Zapier app
* Remove the .git config (so you can optionally run `git init`)
* npm install all needed dependencies
* Register the app with Zapier
* Push a working version as a private app on Zapier

After running this, you'll have a working app in your Zapier editor. This should be your first stop after installing and running `zapier auth`.

```bash
$ zapier create "My App"
$ zapier create "Hello World" --style=helloworld
$ zapier create "Joe's CRM" --style=oauth2
# Let's create your app "My App"!
#
#   Cloning starter app from zapier/example-app - done!
#   Installing project dependencies - done!
#   Creating a new app named "My App" - done!
#   Setting up .zapierapprc file - done!
#   Copying project to temp directory - done!
#   Installing project dependencies - done!
#   Applying entry point file - done!
#   Validating project - done!
#   Building app definition.json - done!
#   Zipping project and dependencies - done!
#   Cleaning up temp directory - done!
#   Uploading version 1.0.0 - done!
#
# Finished!
```


## scaffold

> Adds a sample model, trigger, action or search to your app.

**Usage:** `zapier scaffold {model|trigger|search|write} [--entry|--dest]`

The scaffold command two *primary* things:

* Creates a new destination file like `models/contact.js`
* (Attempts to) import and register it inside your entry `index.js`

You can mix and match several options to customize the created scaffold for your project.

```bash
$ zapier scaffold model "Contact"
$ zapier scaffold model "Contact" --entry=index.js
$ zapier scaffold model "Contag Tag" --dest=models/tag
$ zapier scaffold model "List" --entry=index.js --dest=models/list
```


## describe

> Describes the current app.

**Usage:** `zapier describe`

**TODO!**

This is markdown documentation.


## link

> Link the current directory to an app in your account.

**Usage:** `zapier link`

**TODO!**

This is markdown documentation.


## apps

> Lists all the apps in your account.

**Usage:** `zapier apps`

**TODO!**

This is markdown documentation.


## versions

> Lists all the versions of the current app.

**Usage:** `zapier versions`

**TODO!**

This is markdown documentation.


## validate

> Validates the current project.

**Usage:** `zapier validate`

**TODO!**

This is markdown documentation.


## build

> Builds a deployable zip from the current directory.

**Usage:** `zapier build`

Builds a ready to upload zip file, does not upload now deploy the zip file. Generally you'd use `zapier push` which does this and `zapier upload` in one go.

It does the following steps:

* Creates a temporary folder
* Copies all code into the temporary folder
* Adds an entry point `zapierwrapper.js`
* Generates and validates app definition.
* Detects dependencies via browserify (optional)
* Zips up all needed `.js` files
* Moves the zip to `build/build.zip`

> If you get errors like `Error: Cannot find module 'some-path'`, try disabling dependency detection.

```bash
$ zapier build
$ zapier build --disable-dependency-detection
# Building project.
#
#   Copying project to temp directory - done!
#   Installing project dependencies - done!
#   Applying entry point file - done!
#   Validating project - done!
#   Building app definition.json - done!
#   Zipping project and dependencies - done!
#   Cleaning up temp directory - done!
#
# Build complete!
```


## upload

> Upload the last build as a version.

**Usage:** `zapier upload`

**TODO!**

This is markdown documentation.


## push

> Build and upload a new version of the current app - does not deploy.

**Usage:** `zapier push`

**TODO!**

This is markdown documentation.


## deploy

> Deploys a specific version to a production.

**Usage:** `zapier deploy 1.0.0`


## migrate

> Migrate users from one version to another.

**Usage:** `zapier migrate 1.0.0 1.0.1 [10%]`

**TODO!**

This is markdown documentation.


## deprecate

> Mark a non-production version of your app as deprecated by a certain date.

**Usage:** `zapier deprecate 1.0.0 2018-01-20`

**TODO!**

This is markdown documentation.


## collaborate

> Manage the collaborators on your project. Can optionally --remove.

**Usage:** `zapier collaborate [user@example.com]`

Give any user registered on Zapier the ability to collaborate on your app. Commonly, this is useful for teammates, contractors or other developers who might want to make changes on your app. Only admin access is supported. If you'd only like to provide read-only or testing access, try `zapier invite`.

**Options**

* `[user@example.com]` -- the user to add or remove
* `--remove` -- optionally elect to remove this user, default false
* `--help` -- prints this help text, same as `zapier help collaborate`

```bash
$ zapier collaborate user@example.com
# Preparing to add collaborator user@example.com to your app "Example".
# 
#   Adding user@example.com - done!
# 
# Collaborators updated! Try viewing them with `zapier collaborate`.

$ zapier collaborate user@example.com --remove
# Preparing to remove collaborator user@example.com from your app "Example".
# 
#   Removing user@example.com - done!
# 
# Collaborators updated! Try viewing them with `zapier collaborate`.
```


## invite

> Manage the invitees/testers on your project. Can optionally --delete.

**Usage:** `zapier invite [user@example.com]`

Invite any user registered on Zapier to test your app. Commonly, this is useful for teammates, contractors or other team members who might want to make test, QA or view your apps. If you'd only like to provide admin access, try `zapier collaborate`.

**Options**

* `[user@example.com]` -- the user to add or remove
* `--remove` -- optionally elect to remove this user, default false
* `--help` -- prints this help text, same as `zapier help invite`

```bash
$ zapier invite user@example.com
# Preparing to add invitee user@example.com to your app "Example".
# 
#   Adding user@example.com - done!
# 
# Invitees updated! Try viewing them with `zapier invite`.

$ zapier invite user@example.com --remove
# Preparing to remove invitee user@example.com from your app "Example".
# 
#   Removing user@example.com - done!
# 
# Invitees updated! Try viewing them with `zapier invite`.
```


## history

> Prints all recent history for your app.

**Usage:** `zapier history`

Get the history of your app, listing all the changes made over the lifetime of your app. This includes everything from creation, updates, migrations, collaborator and invitee changes as well as who made the change and when.

```bash
$ zapier history
# The history of your app "Example" listed below.
# 
# ┌──────────────────────────┬───────────────────┬──────────────────┬─────────────────────┐
# │ What                     │ Message           │ Who              │ Timestamp           │
# ├──────────────────────────┼───────────────────┼──────────────────┼─────────────────────┤
# │ collaborator added       │ other@example.com │ user@example.com │ 2016-01-10T16:12:33 │
# │ environment variable set │ API_KEY           │ user@example.com │ 2016-01-01T22:51:01 │
# │ version added            │ 1.2.52            │ user@example.com │ 2016-01-01T22:19:36 │
# │ app created              │ initial creation  │ user@example.com │ 2016-01-01T22:19:28 │
# └──────────────────────────┴───────────────────┴──────────────────┴─────────────────────┘
```


## logs

> Prints recent logs. Can filter --{error|success} --{http|console} --user=you@person.com --detailed --limit=5

**Usage:** `zapier logs --version=1.0.1`

**TODO!**

This is markdown documentation.


## env

> Read and write environment variables.

**Usage:** `zapier env 1.0.0 API_KEY 1234567890`

**TODO!**

This is markdown documentation.
