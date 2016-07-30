## `help`

  Lists all the commands you can use.

  `zapier help`

  You need help using help?

    (╯°□°）╯︵ ┻━┻


## `auth`

  Configure your `~/.zapierrc` with a deploy key for using the CLI.

  `zapier auth`

  ### TODO!

This is markdown documentation.


## `create`

  Creates a new app in your account.

  `zapier create "My Example App"`

  ### TODO!

This is markdown documentation.


## `scaffold`

  Adds a sample model, trigger, action or search to your app.

  `zapier scaffold {model|trigger|search|write} [--entry|--dest]`

  The scaffold command two *primary* things:

* Creates a new destination file like `models/contact.js`
* (Attempts to) import and register it inside your entry `index.js`

### Examples

You can mix and match several options to customize the created scaffold for your project.

```bash
$ zapier scaffold model "Contact"
$ zapier scaffold model "Contact" --entry=index.js
$ zapier scaffold model contact --dest=models/contact
$ zapier scaffold model contact --entry=index.js --dest=models/contact
```


## `describe`

  Describes the current app.

  `zapier describe`

  ### TODO!

This is markdown documentation.


## `link`

  Link the current directory to an app in your account.

  `zapier link`

  ### TODO!

This is markdown documentation.


## `apps`

  Lists all the apps in your account.

  `zapier apps`

  ### TODO!

This is markdown documentation.


## `versions`

  Lists all the versions of the current app.

  `zapier versions`

  ### TODO!

This is markdown documentation.


## `validate`

  Validates the current project.

  `zapier validate`

  ### TODO!

This is markdown documentation.


## `build`

  Builds a deployable zip from the current directory.

  `zapier build`

  ### TODO!

This is markdown documentation.


## `upload`

  Upload the last build as a version.

  `zapier upload`

  ### TODO!

This is markdown documentation.


## `push`

  Build and upload a new version of the current app - does not deploy.

  `zapier push`

  ### TODO!

This is markdown documentation.


## `deploy`

  Deploys a specific version to a production.

  `zapier deploy 1.0.0`

  ### TODO!

This is markdown documentation.


## `migrate`

  Migrate users from one version to another.

  `zapier migrate 1.0.0 1.0.1 [10%]`

  ### TODO!

This is markdown documentation.


## `deprecate`

  Mark a non-production version of your app as deprecated by a certain date.

  `zapier deprecate 1.0.0 2018-01-20`

  ### TODO!

This is markdown documentation.


## `collaborators`

  Manage the collaborators on your project. Can optionally --delete.

  `zapier collaborators [john@example.com]`

  ### TODO!

This is markdown documentation.


## `invitees`

  Manage the invitees/testers on your project. Can optionally --delete.

  `zapier invitees [john@example.com]`

  ### TODO!

This is markdown documentation.


## `history`

  Prints all recent history for your app.

  `zapier history`

  ### TODO!

This is markdown documentation.


## `logs`

  Prints recent logs. Can filter --{error|success} --{http|console} --user=you@person.com --detailed --limit=5

  `zapier logs --version=1.0.1`

  ### TODO!

This is markdown documentation.


## `env`

  Read and write environment variables.

  `zapier env 1.0.0 API_KEY 1234567890`

  ### TODO!

This is markdown documentation.