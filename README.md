# Zapier Platform CLI

A CLI to test, verify, build and deploy an app to Zapier (both private and public apps).


### Install the Zapier CLI

```bash
# make sure you have node & npm installed
# behind the scenes Zapier uses node v0.10.36
# we recommend using nvm or similar to match!
npm install -g zapier-cli

# configure zapier with your deploy key
zapier config
```

### Read the Help

```bash
zapier help
# Usage: zapier COMMAND [command-specific-options]
#   
# All commands listed below.
#   
# Command      Example                         Documentation
# -----------  ------------------------------  ----------------------------------------------------------------------
# help         zapier help                     Lists all the commands you can use.
# config       zapier config                   Configure your ~/.zapier-platform with a deploy key for using the CLI.
# create       zapier create "My Example App"  Creates a new app in your account.
# build        zapier build                    Builds a deployable zip from the current directory. (Debug only)
# apps         zapier apps                     Lists all the apps in your account.
# push         zapier push 1.0.0               Push a new version of the current app - does not deploy.
# versions     zapier versions                 Lists all the versions of the current app.
# deploy       zapier deploy staging 1.0.0     Deploys a specific version to a specific deployment.
# deployments  zapier deployments              Lists all the deployments of the current app.
```

More docs to come!
