# Zapier CLI Reference

These are the generated docs for all Zapier platform CLI commands.

You can install the CLI with `npm`.

```bash
$ npm install -g @zapier/zapier-platform-cli
```

# Commands

## apps

  > Lists all the apps you can access.

  **Usage:** `zapier apps`

  Lists any apps that you have admin access to. Also checks for the current directory for a linked app, which you can control with `zapier link`.

**Arguments**



* `--format={plain,json,raw,table,row}` -- _optional_, display format, default is `table`
* `--help` -- _optional_, prints this help text
* `--debug` -- _optional_, print debug API calls and tracebacks

```bash
$ zapier apps
# All apps listed below.
# 
# ┌─────────┬───────────-─┬─────────────────────┬────────┐
# │ Title   │ Unique Slug │ Timestamp           │ Linked │
# ├─────────┼───────────-─┼─────────────────────┼────────┤
# │ Example │ Example     │ 2016-01-01T22:19:28 │ ✔      │
# └─────────┴───────────-─┴─────────────────────┴────────┘
# 
# Try linking the current directory to a different app with the `zapier link` command.
```


## auth

  > Configure your `/Users/bryanhelmig/.zapierrc` with a deploy key.

  **Usage:** `zapier auth`

  This is an interactive prompt which will set up your account deploy keys and credentials.

> This will change the  `/Users/bryanhelmig/.zapierrc` (home directory identifies the deploy key & user).

```bash
$ zapier auth
# What is your Deploy Key from https://zapier.com/platform/? (Ctl-C to cancel)
#  <type here>
# Your deploy key has been saved to /Users/bryanhelmig/.zapierrc.
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

**Arguments**


* `--disable-dependency-detection` -- _optional_, disables walking required files to slim the build

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


## collaborate

  > Manage the collaborators on your project. Can optionally --remove.

  **Usage:** `zapier collaborate [user@example.com]`

  Give any user registered on Zapier the ability to collaborate on your app. Commonly, this is useful for teammates, contractors or other developers who might want to make changes on your app. Only admin access is supported. If you'd only like to provide read-only or testing access, try `zapier invite`.

**Arguments**

* _none_ -- print all collaborators
* `user@example.com` -- _optional_, which user to add/remove
* `--remove` -- _optional_, optionally elect to remove this user
* `--format={plain,json,raw,table,row}` -- _optional_, display format, default is `table`
* `--help` -- _optional_, prints this help text
* `--debug` -- _optional_, print debug API calls and tracebacks

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


## deploy

  > Deploys a specific version to a production.

  **Usage:** `zapier deploy 1.0.0`

  Deploys an app into production (non-private) rotation, which means new users can use this.

* This **does not** build/upload or push a version to Zapier - you should `zapier push` first.
* This **does not** move old users over to this version - `zapier migrate 1.0.0 1.0.1` does that.

Deploys are an inherently safe operation for all existing users of your app.

> If this is your first time deploying - this will start the platform quality assurance process by alerting the Zapier platform team of your intent to go global. We'll respond within a few business days.

**Arguments**

* `1.0.0` -- **required**,


```bash
$ zapier deploy 1.0.0
# Preparing to deploy version 1.0.0 your app "Example".
# 
#   Deploying 1.0.0 - done!
#   Deploy successful!
# 
# Optionally try the `zapier migrate 1.0.0 1.0.1 [10%]` command to put it into rotation.
```


## deprecate

  > Mark a non-production version of your app as deprecated by a certain date.

  **Usage:** `zapier deprecate 1.0.0 2017-01-20`

  A utility to alert users of breaking changes that require the deprecation of an app version. Zapier will send emails warning users of the impending deprecation.

> Do not use this if you have non-breaking changes, for example, just fixing help text or labels is a very safe operation.

**Arguments**

* `1.0.0` -- **required**, the version to deprecate
* `2017-01-20` -- **required**, what date should we deprecate on


```bash
$ zapier deprecate 1.0.0 2017-01-20
# Preparing to deprecate version 1.0.0 your app "Example".
# 
#   Deprecating 1.0.0 - done!
#   Deprecation successful!
# 
# We'll let users know that this version is no longer recommended and will cease working by 2017-01-20.
```


## describe

  > Describes the current app.

  **Usage:** `zapier describe`

  Prints a human readable enumeration of your app's triggers, searches and actions as seen by our system. Useful to understand how your models convert and relate to different actions.

> These are the same actions we'd display in our editor!

* `Noun` -- your action's noun
* `Label` -- your action's label
* `Model` -- the model (if any) this action is tied to
* `Available Methods` -- testable methods for this action

**Arguments**



* `--format={plain,json,raw,table,row}` -- _optional_, display format, default is `table`
* `--help` -- _optional_, prints this help text
* `--debug` -- _optional_, print debug API calls and tracebacks

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


## env

  > Read and write environment variables.

  **Usage:** `zapier env 1.0.0 API_KEY 1234567890`

  Manage the environment of your app so that `process.env` can access the keys, making it easy to match a local environment with working environment via `API_KEY=1234567890 npm test`.

**Arguments**

* _none_ -- print a table of all environment variables, regardless of app version
* `1.0.0` -- **required**, the app version's environment to work on
* `API_KEY` -- _optional_, the uppercase key of the environment variable to set
* `1234567890` -- _optional_, the raw value to set to the key
* `--format={plain,json,raw,table,row}` -- _optional_, display format, default is `table`
* `--help` -- _optional_, prints this help text
* `--debug` -- _optional_, print debug API calls and tracebacks

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


## help

  > Lists all the commands you can use.

  **Usage:** `zapier help [command]`

  Prints documentation to the terminal screen.

Generally - the `zapier` command works off of two files:

 * /Users/bryanhelmig/.zapierrc      (home directory identifies the deploy key & user)
 * ./.zapierapprc   (current directory identifies the app)

The `zapier auth` and `zapier register "Example"` or `zapier link` commands will help manage those files. All commands listed below.

**Arguments**

* _none_ -- print all commands
* `value` -- _optional_, the command to view docs for
* `--format={plain,json,raw,table,row}` -- _optional_, display format, default is `table`
* `--help` -- _optional_, prints this help text
* `--debug` -- _optional_, print debug API calls and tracebacks

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
# The `zapier auth` and `zapier init`/`zapier link` commands will help manage those files. All commands listed below.
# 
# ┌─────────────┬───────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────┐
# │ Command     │ Example                               │ Help                                                                       │
# ├─────────────┼───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
# │ apps        │ zapier apps                           │ Lists all the apps you can access.                                         │
# │ auth        │ zapier auth                           │ Configure your `/Users/username/.zapierrc` with a deploy key.              │
# │ build       │ zapier build                          │ Builds a deployable zip from the current directory.                        │
# │ collaborate │ zapier collaborate [user@example.com] │ Manage the collaborators on your project. Can optionally --remove.         │
# │ deploy      │ zapier deploy 1.0.0                   │ Deploys a specific version to a production.                                │
# │ deprecate   │ zapier deprecate 1.0.0 2017-01-20     │ Mark a non-production version of your app as deprecated by a certain date. │
# │ describe    │ zapier describe                       │ Describes the current app.                                                 │
# │ env         │ zapier env 1.0.0 API_KEY 1234567890   │ Read and write environment variables.                                      │
# │ help        │ zapier help [command]                 │ Lists all the commands you can use.                                        │
# │ history     │ zapier history                        │ Prints all recent history for your app.                                    │
# │ init        │ zapier init [location]                │ Initializes a new zapier app in a directory.                               │
# │ invite      │ zapier invite [user@example.com]      │ Manage the invitees/testers on your project. Can optionally --remove.      │
# │ link        │ zapier link                           │ Link the current directory to an app you have access to.                   │
# │ logs        │ zapier logs                           │ Prints recent logs. See help for filter arguments.                         │
# │ migrate     │ zapier migrate 1.0.0 1.0.1 [10%]      │ Migrate users from one version to another.                                 │
# │ push        │ zapier push                           │ Build and upload a new version of the current app - does not deploy.       │
# │ register    │ zapier register "Example" [directory] │ Registers a new app in your account.                                       │
# │ scaffold    │ zapier scaffold model "Contact"       │ Adds a sample model, trigger, action or search to your app.                │
# │ test        │ zapier test                           │ Tests your app via `npm test`.                                             │
# │ upload      │ zapier upload                         │ Upload the last build as a version.                                        │
# │ validate    │ zapier validate                       │ Validates the current project.                                             │
# │ versions    │ zapier versions                       │ Lists all the versions of the current app.                                 │
# │ watch       │ zapier watch                          │ Watch the current directory and send changes live to Zapier.               │
# └─────────────┴───────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────┘
```


## history

  > Prints all recent history for your app.

  **Usage:** `zapier history`

  Get the history of your app, listing all the changes made over the lifetime of your app. This includes everything from creation, updates, migrations, collaborator and invitee changes as well as who made the change and when.

**Arguments**



* `--format={plain,json,raw,table,row}` -- _optional_, display format, default is `table`
* `--help` -- _optional_, prints this help text
* `--debug` -- _optional_, print debug API calls and tracebacks

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


## init

  > Initializes a new zapier app in a directory.

  **Usage:** `zapier init [location]`

  Initializes a new zapier app. Clones a working example Github repository Zapier app.

After running this, you'll have a new example app in your directory. If you re-run this command
on an existing directory it will leave existing files alone and not clobber them.

**Arguments**

* `.` -- _optional_, , default is `.`
* `--template={minimal,helloworld}` -- _optional_, select a starting app template, default is `minimal`

```bash
$ zapier init example-dir --template=helloworld
# Let's create your app!
#
#   Cloning starter app from zapier/example-app - done!
#
# Finished!
```


## invite

  > Manage the invitees/testers on your project. Can optionally --remove.

  **Usage:** `zapier invite [user@example.com]`

  Invite any user registered on Zapier to test your app. Commonly, this is useful for teammates, contractors or other team members who might want to make test, QA or view your apps. If you'd only like to provide admin access, try `zapier collaborate`.

**Arguments**

* _none_ -- print all invitees
* `user@example.com` -- _optional_, which user to add/remove
* `--remove` -- _optional_, optionally elect to remove this user
* `--format={plain,json,raw,table,row}` -- _optional_, display format, default is `table`
* `--help` -- _optional_, prints this help text
* `--debug` -- _optional_, print debug API calls and tracebacks

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


## link

  > Link the current directory to an app you have access to.

  **Usage:** `zapier link`

  Link the current directory to an app you have access to. It is fairly uncommon to run this command - more often you'd just `git clone git@github.com:example-inc/example.git` which would have a `.zapierapprc` file already included. If not, you'd need to be an admin on the app and use this command to regenerate the `.zapierapprc` file.

Or, if you are making an app from scratch - you'd prefer the `zapier init`.

> This will change the  `./.zapierapprc` (which identifies the app assosciated with the current directory).

**Arguments**



* `--format={plain,json,raw,table,row}` -- _optional_, display format, default is `table`
* `--help` -- _optional_, prints this help text
* `--debug` -- _optional_, print debug API calls and tracebacks

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


## logs

  > Prints recent logs. See help for filter arguments.

  **Usage:** `zapier logs`

  Get the logs that are automatically collected during the running of your app. Either explicitly during `z.context.line()`, automatically via `z.request()` or any sort of traceback or error.

> Does not collect or list the errors found locally during `npm test`.

**Arguments**


* `--version=value` -- _optional_, display only this version's logs
* `--status={any,success,error}` -- _optional_, display only success (<400/info) logs or error (>400/tracebacks), default is `any`
* `--type={console,http}` -- _optional_, display only console or http logs, default is `console`
* `--detailed` -- _optional_, show detailed logs (like http body)
* `--user=user@example.com` -- _optional_, display only this users logs, default is `me`
* `--limit=50` -- _optional_, control the maximum result size, default is `50`
* `--format={plain,json,raw,table,row}` -- _optional_, display format, default is `table`
* `--help` -- _optional_, prints this help text
* `--debug` -- _optional_, print debug API calls and tracebacks

```bash
$ zapier logs
# The logs of your app "Example" listed below.
# 
# ┌──────────────────────────────────────────────────────┐
# │ = 1 =                                                │
# │     Log       │ console says hello world!            │
# │     Version   │ 1.0.0                                │
# │     Step      │ 99c16565-1547-4b16-bcb5-45189d9d8afa │
# │     Timestamp │ 2016-01-01T23:04:36-05:00            │
# └───────────────┴──────────────────────────────────────┘

$ zapier logs --type=http
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

$ zapier logs --type=http --detailed --format=plain
# The logs of your app "Example" listed below.
# 
# == Status
# 200
# == URL
# http://httpbin.org/get
# == Querystring
# hello=world
# == Version
# 1.0.0
# == Step
# 99c16565-1547-4b16-bcb5-45189d9d8afa
# == Timestamp
# 2016-08-03T23:04:36-05:00
# == Request Body
# == Response Body
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
```


## migrate

  > Migrate users from one version to another.

  **Usage:** `zapier migrate 1.0.0 1.0.1 [10%]`

  Starts a migration to move users between different versions of your app. You may also "revert" by simply swapping the from/to verion strings in the command line arguments (IE: `zapier migrate 1.0.1 1.0.0`).

Only migrate users between non-breaking versions, use `zapier deprecate` if you have breaking changes!

Migrations can take between 5-10 minutes, so be patient and check `zapier history` to track the status.

> Tip! We recommend migrating a small subset of users first, then watching error logs for the new version for any sort of odd behavior. When you feel confident there are no bugs, go ahead and migrate everyone. If you see unexpected errors, you can revert.

**Arguments**

* `1.0.0` -- **required**, the version **from** which to migrate users
* `1.0.1` -- **required**, the version **to** which to migrate users
* `100%` -- _optional_, percent of users to migrate, default is `100%`


```bash
$ zapier migrate 1.0.0 1.0.1 15%
# Getting ready to migrate your app "Example" from 1.0.0 to 1.0.1.
# 
#   Starting migration from 1.0.0 to 1.0.1 for 15% - done!
# 
# Deploy successfully queued, please check `zapier history` to track the status. Normal deploys take between 5-10 minutes.
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

If you have not yet registered your app, this command will prompt you for your app title and register the app.

> Note: You might consider `zapier watch` for a faster development cycle!

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


## register

  > Registers a new app in your account.

  **Usage:** `zapier register "Example" [directory]`

  This command registers your app with Zapier. After running this, you can run `zapier push` to deploy a version of your app that you can use in your Zapier editor.

> This will change the  `./.zapierapprc` (which identifies the app assosciated with the current directory).

**Arguments**

* `"My App Name"` -- **required**,


```bash
$ zapier register "Example" example-dir
# Let's register your app "Example" on Zapier!
#
#   Creating a new app named "Example" on Zapier - done!
#   Setting up .zapierapprc file - done!
#   Applying entry point file - done!
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

> Note, we may fail to rewrite your `index.js` so you may need to handle the require and registration yourself.

**Arguments**

* `{index,oauth2,model,trigger,search,write}` -- **required**, what type of thing are you creating
* `"Some Name"` -- **required**, the name of the new thing to create
* `--dest={type}s/{name}` -- _optional_, sets the new file's path, default is `{type}s/{name}`
* `--entry=index.js` -- _optional_, where to import the new file, default is `index.js`

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


## test

  > Tests your app via `npm test`.

  **Usage:** `zapier test`

  This command is effectively the same as npm test (which we normally recommend mocha tests) - except we can wire in some custom tests to validate your app.

**Arguments**




```bash
$ zapier test
# > node_modules/mocha/bin/mocha
# 
#   app
#     validation
#       ✓ should be a valid app
# 
#   triggers
#     hello world
#       ✓ should load fine (777ms)
# 
#   2 passing (817ms)
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


## validate

  > Validates the current project.

  **Usage:** `zapier validate`

  Runs the standard validation routine powered by json-schema that checks your app for any structural errors. This is the same routine that is run during `zapier build`, `zapier uploard`, `zapier push` or even as a test in `npm test`.

**Arguments**



* `--format={plain,json,raw,table,row}` -- _optional_, display format, default is `table`
* `--help` -- _optional_, prints this help text
* `--debug` -- _optional_, print debug API calls and tracebacks

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


## versions

  > Lists all the versions of the current app.

  **Usage:** `zapier versions`

  **Arguments**



* `--format={plain,json,raw,table,row}` -- _optional_, display format, default is `table`
* `--help` -- _optional_, prints this help text
* `--debug` -- _optional_, print debug API calls and tracebacks

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


## watch

  > Watch the current directory and send changes live to Zapier.

  **Usage:** `zapier watch`

  This command watches the current directory, on changes it does two things:

* Sends any new changes to Zapier, instantly updating the UI in your Zapier editor.
* Tunnels all Javascript calls through your local environment with logs to stdout.

This makes for a great development experience, letting you make and observe changes much faster than a `zapier push`

> Note: this is only temporary and has no effect on other users at Zapier! You'll want to do `zapier push` to make your changes permanent and universal.

**Arguments**


* `--port=7545` -- _optional_, what port should we host/listen for tunneling, default is `7545`
* `--format={plain,json,raw,table,row}` -- _optional_, display format, default is `table`
* `--help` -- _optional_, prints this help text
* `--debug` -- _optional_, print debug API calls and tracebacks

```bash
$ zapier watch --port=9090
# Watching and running your app locally. Zapier will tunnel JS calls here.
# 
#   Starting local server on port 9090 - done!
#   Starting local tunnel for port 9090 - done!
# 
# Running! Make changes local and you should see them reflect almost instantly in the Zapier editor.
# 
#   Reloading for index.js - done!
#   Reloading for models/form.js - done!
#   Reloading for index.js - done!
```
