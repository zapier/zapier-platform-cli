## `help`

> `zapier help`

Lists all the commands you can use.

You need help using help?

    (╯°□°）╯︵ ┻━┻


## `auth`

> `zapier auth`

Configure your ~/.zapierrc with a deploy key for using the CLI.

### TODO!

This is markdown documentation.


## `create`

> `zapier create "My Example App"`

Creates a new app in your account.

### TODO!

This is markdown documentation.


## `scaffold`

> `zapier scaffold {model|trigger|search|write} [--entry|--dest]`

Adds a sample model, trigger, action or search to your app.

The scaffold command two *primary* things:

* Creates a new destination file like `models/contact.js`
* (Attempts to) import and register it inside your entry `index.js`

### Examples

    $ zapier scaffold model "Contact"
    $ zapier scaffold model "Contact" --entry=index.js
    $ zapier scaffold model contact --dest=models/contact
    $ zapier scaffold model contact --entry=index.js --dest=models/contact


## `describe`

> `zapier describe`

Describes the current app.

### TODO!

This is markdown documentation.


## `link`

> `zapier link`

Link the current directory to an app in your account.

### TODO!

This is markdown documentation.


## `apps`

> `zapier apps`

Lists all the apps in your account.

### TODO!

This is markdown documentation.


## `versions`

> `zapier versions`

Lists all the versions of the current app.

### TODO!

This is markdown documentation.


## `validate`

> `zapier validate`

Validates the current project.

### TODO!

This is markdown documentation.


## `build`

> `zapier build`

Builds a deployable zip from the current directory.

### TODO!

This is markdown documentation.


## `upload`

> `zapier upload`

Upload the last build as a version.

### TODO!

This is markdown documentation.


## `push`

> `zapier push`

Build and upload a new version of the current app - does not deploy.

### TODO!

This is markdown documentation.


## `deploy`

> `zapier deploy 1.0.0`

Deploys a specific version to a production.

### TODO!

This is markdown documentation.


## `migrate`

> `zapier migrate 1.0.0 1.0.1 [10%]`

Migrate users from one version to another.

### TODO!

This is markdown documentation.


## `deprecate`

> `zapier deprecate 1.0.0 2018-01-20`

Mark a non-production version of your app as deprecated by a certain date.

### TODO!

This is markdown documentation.


## `collaborators`

> `zapier collaborators [john@example.com]`

Manage the collaborators on your project. Can optionally --delete.

### TODO!

This is markdown documentation.


## `invitees`

> `zapier invitees [john@example.com]`

Manage the invitees/testers on your project. Can optionally --delete.

### TODO!

This is markdown documentation.


## `history`

> `zapier history`

Prints all recent history for your app.

### TODO!

This is markdown documentation.


## `logs`

> `zapier logs --version=1.0.1`

Prints recent logs. Can filter --{error|success} --{http|console} --user=you@person.com --detailed --limit=5

### TODO!

This is markdown documentation.


## `env`

> `zapier env 1.0.0 API_KEY 1234567890`

Read and write environment variables.

### TODO!

This is markdown documentation.