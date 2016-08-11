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
$ zapier help apps
$ zapier help scaffold
$ zapier help
# Usage: zapier COMMAND [command-specific-arguments] [--command-specific-options]
# 
# This Zapier command works off of two files:
# 
#  * ~/.zapierrc      (home directory identifies the deploy key & user)
#  * ./.zapierapprc   (current directory identifies the app)
# 
# The `zapier auth` and `zapier create`/`zapier link` commands will help manage those files. All commands listed below.
# 
# ┌─────────────┬───────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────┐
# │ Command     │ Example                               │ Help                                                                       │
# ├─────────────┼───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
# │ help        │ zapier help [command]                 │ Lists all the commands you can use.                                        │
# │ auth        │ zapier auth                           │ Configure your `~/.zapierrc` with a deploy key for using the CLI.          │
# │ create      │ zapier create "Example" [dir]         │ Creates a new app in your account.                                         │
# │ scaffold    │ zapier scaffold model "Contact"       │ Adds a sample model, trigger, action or search to your app.                │
# │ describe    │ zapier describe                       │ Describes the current app.                                                 │
# │ link        │ zapier link                           │ Link the current directory to an app in your account.                      │
# │ apps        │ zapier apps                           │ Lists all the apps you can access.                                         │
# │ versions    │ zapier versions                       │ Lists all the versions of the current app.                                 │
# │ validate    │ zapier validate                       │ Validates the current project.                                             │
# │ build       │ zapier build                          │ Builds a deployable zip from the current directory.                        │
# │ upload      │ zapier upload                         │ Upload the last build as a version.                                        │
# │ push        │ zapier push                           │ Build and upload a new version of the current app - does not deploy.       │
# │ deploy      │ zapier deploy 1.0.0                   │ Deploys a specific version to a production.                                │
# │ migrate     │ zapier migrate 1.0.0 1.0.1 [10%]      │ Migrate users from one version to another.                                 │
# │ deprecate   │ zapier deprecate 1.0.0 2017-01-20     │ Mark a non-production version of your app as deprecated by a certain date. │
# │ collaborate │ zapier collaborate [user@example.com] │ Manage the collaborators on your project. Can optionally --remove.         │
# │ invite      │ zapier invite [user@example.com]      │ Manage the invitees/testers on your project. Can optionally --remove.      │
# │ history     │ zapier history                        │ Prints all recent history for your app.                                    │
# │ logs        │ zapier logs                           │ Prints recent logs. See help for filter arguments.                         │
# │ env         │ zapier env 1.0.0 API_KEY 1234567890   │ Read and write environment variables.                                      │
# └─────────────┴───────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────┘
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

**Usage:** `zapier create "Example" [dir]`

A handy command that will perform a bunch of steps for you:

* Clone an working example Github repository Zapier app
* Remove the .git config (so you can optionally run `git init`)
* npm install all needed dependencies
* Register the app with Zapier
* Push a working version as a private app on Zapier

After running this, you'll have a working app in your Zapier editor. This should be your first stop after installing and running `zapier auth`.

**Options**

* `"Example"` -- the name of your app
* `[dir]` -- an optional directory, default is `.`
* `--style={helloworld|oauth2}` -- select a starting app template

```bash
$ zapier create "Example" example-dir --style=helloworld
# Let's create your app "Example"!
#
#   Cloning starter app from zapier/example-app - done!
#   Installing project dependencies - done!
#   Creating a new app named "Example" - done!
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

**Usage:** `zapier scaffold {model|trigger|search|write} "Name"`

The scaffold command does two general things:

* Creates a new destination file like `models/contact.js`
* (Attempts to) import and register it inside your entry `index.js`

You can mix and match several options to customize the created scaffold for your project.

> Note, we may fail to rewrite your `index.js` so you may need to handle the 

**Options**

* `{model|trigger|search|write}` - what thing are you creating
* `"Name"` -- the name of the new thing to create
* `--dest=path` -- sets the new file's path, default is `'{type}s/{name}'`
* `--entry=path` -- where to import the new file, default is `'index.js'`

```bash
$ zapier scaffold model "Contact"
$ zapier scaffold model "Contact" --entry=index.js
$ zapier scaffold model "Contag Tag" --dest=models/tag
$ zapier scaffold model "Tag" --entry=index.js --dest=models/tag
# Adding model scaffold to your project.
# 
#   Writing new models/tag.js - done!
#   Rewriting your index.js - done!
# 
# Finished! We did the best we could, you might gut check your files though.
```


## describe

> Describes the current app.

**Usage:** `zapier describe`

Prints a human readable enumeration of your app's triggers, searches and actions as seen by our system. Useful to understand how your models relate to different actions.

**Options**

* `--format={plain|raw|row|table}` -- display format, default is `table`
* `--help` -- prints this help text, same as `zapier help describe`
* `--debug` -- print debug API calls and tracebacks

```bash
$ zapier describe
# A description of your app "Example" listed below.
# 
# Triggers
# 
# ┌─────────────┬──────────┬───────────────┬─────────────────┬───────────────────┐
# │ key         │ noun     │ display.label │ operation.model │ operation.perform │
# ├─────────────┼──────────┼───────────────┼─────────────────┼───────────────────┤
# │ hello_world │ Greeting │ New Greeting  │ n/a             │ $func$2$f$        │
# └─────────────┴──────────┴───────────────┴─────────────────┴───────────────────┘
# 
# Searches
# 
#  Nothing found for searches, maybe try the `zapier scaffold` command?
# 
# Writes
# 
#  Nothing found for writes, maybe try the `zapier scaffold` command?
# 
# If you'd like to add more, try the `zapier scaffold` command to kickstart!
```


## link

> Link the current directory to an app in your account.

**Usage:** `zapier link`

Link the current directory to an app you have access to. It is fairly uncommon to run this command - more often you'd just `git clone git@github.com:example-inc/example.git` which would have a `.zapierapprc` file already included. If not, you'd need to be an admin on the app and use this command to regenerate the `.zapierapprc` file.

Or, if you are making an app from scratch - you'd prefer the `zapier create "Example"`.

**Options**

* `--format={plain|raw|row|table}` -- display format, default is `table`
* `--help` -- prints this help text, same as `zapier help link`
* `--debug` -- print debug API calls and tracebacks

```bash
$ zapier link
# Which app would you like to link the current directory to?
# 
# ┌────────┬─────────────┬────────────┬─────────────────────┬────────┐
# │ Number │ Title       │ Unique Key │ Timestamp           │ Linked │
# ├────────┼─────────────┼────────────┼─────────────────────┼────────┤
# │ 1      │ Example     │ Example    │ 2016-01-01T22:19:28 │ ✔      │
# └────────┴─────────────┴────────────┴─────────────────────┴────────┘
#      ...or type any title to create new app!
# 
# Which app number do you want to link? You also may type a new app title to create one. (Ctl-C to cancel)
# 
  1
# 
#   Selecting existing app "Example" - done!
#   Setting up `.zapierapprc` file - done!
# 
# Finished! You can `zapier push` now to build & upload a version!
```


## apps

> Lists all the apps you can access.

**Usage:** `zapier apps`

Lists any apps that you have admin access to. Also checks for the current directory for a linked app, which you can control with `zapier link`.

**Options**

* `--format={plain|raw|row|table}` -- display format, default is `table`
* `--help` -- prints this help text, same as `zapier help apps`
* `--debug` -- print debug API calls and tracebacks

```bash
$ zapier apps
# All apps listed below.
# 
# ┌─────────┬────────────┬─────────────────────┬────────┐
# │ Title   │ Unique Key │ Timestamp           │ Linked │
# ├─────────┼────────────┼─────────────────────┼────────┤
# │ Example │ Example    │ 2016-01-01T22:19:28 │ ✔      │
# └─────────┴────────────┴─────────────────────┴────────┘
# 
# Try linking the current directory to a different app with the `zapier link` command.
```


## versions

> Lists all the versions of the current app.

**Usage:** `zapier versions`

**Options**

* `--format={plain|raw|row|table}` -- display format, default is `table`
* `--help` -- prints this help text, same as `zapier help versions`
* `--debug` -- print debug API calls and tracebacks

```bash
$ zapier versions
# All versions of your app "Example" listed below.
# 
# ┌─────────┬──────────┬───────┬────────────────┬──────────────────┬─────────────────────┐
# │ Version │ Platform │ Users │ Deployment     │ Deprecation Date │ Timestamp           │
# ├─────────┼──────────┼───────┼────────────────┼──────────────────┼─────────────────────┤
# │ 1.0.0   │ 3.0.0    │ 0     │ non-production │ null             │ 2016-01-01T22:19:36 │
# └─────────┴──────────┴───────┴────────────────┴──────────────────┴─────────────────────┘
```


## validate

> Validates the current project.

**Usage:** `zapier validate`

Runs the standard validation routine powered by json-schema that checks your app for any structural errors. This is the same routine that is run during `zapier build`, `zapier uploard`, `zapier push` or even as a test in `npm test`.

**Options**

* `--format={plain|raw|row|table}` -- display format, default is `table`
* `--help` -- prints this help text, same as `zapier help validate`
* `--debug` -- print debug API calls and tracebacks

```bash
$ zapier validate
# Validating project locally.
# 
# No errors found during validation routine.
# 
# This project looks good!

$ zapier validate
# Validating project locally.
# 
# ┌───────────────────────────────────────────────────────────────────────────────────────────────┐
# │ = 1 =                                                                                         │
# │     Property │ instance                                                                       │
# │     Message  │ requires property "platformVersion"                                            │
# │     Links    │ https://github.com/zapier/zapier-platform-schema/blob/v3.0.0/docs.md#appschema │
# └──────────────┴────────────────────────────────────────────────────────────────────────────────┘
# 
# Make any changes to your project and rerun this command.
```


## build

> Builds a deployable zip from the current directory.

**Usage:** `zapier build`

Builds a ready to upload zip file, does not upload now deploy the zip file. Generally you'd use `zapier push` which does this and `zapier upload` together.

It does the following steps:

* Creates a temporary folder
* Copies all code into the temporary folder
* Adds an entry point `zapierwrapper.js`
* Generates and validates app definition.
* Detects dependencies via browserify (optional)
* Zips up all needed `.js` files
* Moves the zip to `build/build.zip`

> If you get live errors like `Error: Cannot find module 'some-path'`, try disabling dependency detection.

**Options**

* `--disable-dependency-detection` -- disables walking required files to slim the build

```bash
$ zapier build
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

Upload the zip file already built by `zapier build` in build/build.zip. The versions and other app details are read by Zapier from the zip file.

> Note: we generally recommend using `zapier push` which does both `zapier build && zapier upload` in one step.

```bash
$ zapier upload
# Preparing to upload a new version.
# 
#   Uploading version 1.0.0 - done!
# 
# Upload of build/build.zip complete! Try `zapier versions` now!
```


## push

> Build and upload a new version of the current app - does not deploy.

**Usage:** `zapier push`

A shortcut for `zapier build && zapier upload` - this is our recommended way to push a new version. This is a common workflow:

1. Make changes in `index.js` or other files.
2. Run `npm test`.
3. Run `zapier push`.
4. QA/experiment in the Zapier.com Zap editor.
5. Go to 1 and repeat.

> Note: this is always a safe operation as live/production apps are protected from pushes. You must use `zapier deploy` or `zapier migrate` to impact live users.

```bash
$ zapier push
# Preparing to build and upload a new version.
# 
#   Copying project to temp directory - done!
#   Installing project dependencies - done!
#   Applying entry point file - done!
#   Validating project - done!
#   Building app definition.json - done!
#   Zipping project and dependencies - done!
#   Cleaning up temp directory - done!
#   Uploading version 1.0.0 - done!
# 
# Build and upload complete! Try loading the Zapier editor now, or try `zapier deploy` to put it into rotation or `zapier migrate` to move users over
```


## deploy

> Deploys a specific version to a production.

**Usage:** `zapier deploy 1.0.0`

Deploys an app into production (non-private) rotation, which means new users can use this.

* This **does not** build/upload or push a version to Zapier - you should `zapier push` first.
* This **does not** move old users over to this version - `zapier migrate 1.0.0 1.0.1` does that.

Deploys are an inherently safe operation for all existing users of your app.

> If this is your first time deploying - this will start the platform quality assurance process by alerting the Zapier platform team of your intent to go global. We'll respond within a few business days.

```bash
$ zapier deploy 1.0.0
# Preparing to deploy version 1.0.0 your app "Example".
# 
#   Deploying 1.0.0 - done!
#   Deploy successful!
# 
# Optionally try the `zapier migrate 1.0.0 1.0.1 [10%]` command to put it into rotation.
```


## migrate

> Migrate users from one version to another.

**Usage:** `zapier migrate 1.0.0 1.0.1 [10%]`

Starts a migration to move users between different versions of your app. You may also "revert" by simply swapping the from/to verion strings in the command line arguments (IE: `zapier migrate 1.0.1 1.0.0`).

Only migrate users between non-breaking versions, use `zapier deprecate` if you have breaking changes!

Migrations can take between 5-10 minutes, so be patient and check `zapier history` to track the status.

> Tip! We recommend migrating a small subset of users first, then watching error logs for the new version for any sort of odd behavior. When you feel confident there are no bugs, go ahead and migrate everyone. If you see unexpected errors, you can revert.

**Options**

* `1.0.0` -- the version **from** which to migrate users
* `1.0.1` -- the version **to** which to migrate users
* `[10%]` -- an optional percent of users to migrate, default is `100%`
* `--format={plain|raw|row|table}` -- display format, default is `table`
* `--help` -- prints this help text, same as `zapier help migrate`
* `--debug` -- print debug API calls and tracebacks

```bash
$ zapier migrate 1.0.0 1.0.1 15%
# Getting ready to migrate your app "Example" from 1.0.0 to 1.0.1.
# 
#   Starting migration from 1.0.0 to 1.0.1 for 15% - done!
# 
# Deploy successfully queued, please check `zapier history` to track the status. Normal deploys take between 5-10 minutes.
```


## deprecate

> Mark a non-production version of your app as deprecated by a certain date.

**Usage:** `zapier deprecate 1.0.0 2017-01-20`

A utility to alert users of breaking changes that require the deprecation of an app version. Zapier will send emails warning users of the impending deprecation.

> Do not use this if you have non-breaking changes, for example, just fixing help text or labels is a very safe operation.

**Options**

* `1.0.0` -- the version to deprecate
* `2017-01-20` -- what date should we deprecate on

```bash
$ zapier deprecate 1.0.0 2017-01-20
# Preparing to deprecate version 1.0.0 your app "Example".
# 
#   Deprecating 1.0.0 - done!
#   Deprecation successful!
# 
# We'll let users know that this version is no longer recommended and will cease working by 2017-01-20.
```


## collaborate

> Manage the collaborators on your project. Can optionally --remove.

**Usage:** `zapier collaborate [user@example.com]`

Give any user registered on Zapier the ability to collaborate on your app. Commonly, this is useful for teammates, contractors or other developers who might want to make changes on your app. Only admin access is supported. If you'd only like to provide read-only or testing access, try `zapier invite`.

**Options**

* _none_ -- print a table of all collaborators
* `[user@example.com]` -- the user to add or remove
* `--format={plain|raw|row|table}` -- display format, default is `table`
* `--help` -- prints this help text, same as `zapier help collaborate`
* `--debug` -- print debug API calls and tracebacks

```bash
$ zapier collaborate
# The collaborators on your app "Example" listed below.
# 
# ┌──────────────────┬───────┬──────────┐
# │ Email            │ Role  │ Status   │
# ├──────────────────┼───────┼──────────┤
# │ user@example.com │ admin │ accepted │
# └──────────────────┴───────┴──────────┘

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

> Manage the invitees/testers on your project. Can optionally --remove.

**Usage:** `zapier invite [user@example.com]`

Invite any user registered on Zapier to test your app. Commonly, this is useful for teammates, contractors or other team members who might want to make test, QA or view your apps. If you'd only like to provide admin access, try `zapier collaborate`.

**Options**

* _none_ -- print a table of all invitees
* `[user@example.com]` -- the user to add or remove
* `--remove` -- optionally elect to remove this user, default false
* `--format={plain|raw|row|table}` -- display format, default is `table`
* `--help` -- prints this help text, same as `zapier help invite`
* `--debug` -- print debug API calls and tracebacks

```bash
$ zapier invite
# The invitees on your app "Example" listed below.
# 
# ┌──────────────────┬─────────┬──────────┐
# │ Email            │ Role    │ Status   │
# ├──────────────────┼─────────┼──────────┤
# │ user@example.com │ invitee │ accepted │
# └──────────────────┴─────────┴──────────┘

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

**Options**

* `--format={plain|raw|row|table}` -- display format, default is `table`
* `--help` -- prints this help text, same as `zapier help history`
* `--debug` -- print debug API calls and tracebacks

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

> Prints recent logs. See help for filter arguments.

**Usage:** `zapier logs`

Get the logs that are automatically collected during the running of your app. Either explicitly during `z.console.log()`, automatically via `z.request()` or any sort of traceback or error.

> Does not collect or list the errors found locally during `npm test`.

**Options**

* `--version=1.0.0` -- display only this version's logs, default `null`
* `--{error|success}` -- display only error or success logs, default `'success'`
* `--{console|http}` -- display only console or http logs, default `'http'`
* `--detailed` -- show detailed logs (like http body), default `false`
* `--user=user@example.com` -- display only this users logs, default `null`
* `--limit=5` -- display only console or http logs, default `50`
* `--format={plain|raw|row|table}` -- display format, default is `table`
* `--help` -- prints this help text, same as `zapier help logs`
* `--debug` -- print debug API calls and tracebacks

```bash
$ zapier logs
# The logs of your app "Example" listed below.
# 
# ┌────────────────────────────────────────────────────────┐
# │ = 1 =                                                  │
# │     Status      │ 200                                  │
# │     URL         │ http://httpbin.org/get               │
# │     Querystring │ hello=world                          │
# │     Version     │ 1.0.0                                │
# │     Step        │ 99c16565-1547-4b16-bcb5-45189d9d8afa │
# │     Timestamp   │ 2016-01-01T23:04:36-05:00            │
# └─────────────────┴──────────────────────────────────────┘

$ zapier logs --http --detailed --format=plain
# The logs of your app "Example" listed below.
# 
# Status
# 200
# URL
# http://httpbin.org/get
# Querystring
# hello=world
# Version
# 1.0.0
# Step
# 99c16565-1547-4b16-bcb5-45189d9d8afa
# Timestamp
# 2016-08-03T23:04:36-05:00
# Request Body
# undefined
# Response Body
# {
#   "args": {
#     "hello": "world"
#   },
#   "headers": {
#     "Accept": "*/*",
#     "Accept-Encoding": "gzip,deflate",
#     "Host": "httpbin.org",
#     "User-Agent": "Zapier"
#   },
#   "origin": "123.123.123.123",
#   "url": "http://httpbin.org/get?hello=world"
# }

$ zapier logs --console
# The logs of your app "Example" listed below.
# 
# ┌──────────────────────────────────────────────────────┐
# │ = 1 =                                                │
# │     Log       │ console says hello world!            │
# │     Version   │ 1.0.0                                │
# │     Step      │ 99c16565-1547-4b16-bcb5-45189d9d8afa │
# │     Timestamp │ 2016-01-01T23:04:36-05:00            │
# └───────────────┴──────────────────────────────────────┘
```


## env

> Read and write environment variables.

**Usage:** `zapier env 1.0.0 API_KEY 1234567890`

Manage the environment of your app so that `process.env` can access the keys, making it easy to match a local environment with working environment via `API_KEY=1234567890 npm test`.

**Options**

* `1.0.0` -- the version of the app to apply (omit to see all)
* `KEY` -- the uppercase key of the environment variable to set
* `VALUE` -- the raw value to set to the key
* `--format={plain|raw|row|table}` -- display format, default is `table`
* `--help` -- prints this help text, same as `zapier help env`
* `--debug` -- print debug API calls and tracebacks

```bash
$ zapier env 1.0.0
# The env of your "Example" listed below.
# 
# ┌─────────┬─────────┬────────────┐
# │ Version │ Key     │ Value      │
# ├─────────┼─────────┼────────────┤
# │ 1.0.0   │ API_KEY │ 1234567890 │
# └─────────┴─────────┴────────────┘
# 
# Try setting an env with the `zapier env 1.0.0 API_KEY 1234567890` command.

$ zapier env 1.0.0 API_KEY 1234567890
# Preparing to set environment API_KEY for your 1.0.0 "Example".
# 
#   Setting API_KEY to "1234567890" - done!
# 
# Environment updated! Try viewing it with `zapier env 1.0.0`.
```
