## Introduction

Zapier is a platform for creating integrations and workflows. This CLI is your gateway to creating custom applications on the Zapier platform.


## Getting Started

The Zapier CLI requires Node `v4.3.2` or higher, we recommend using [nvm](https://github.com/creationix/nvm) and [homebrew](http://brew.sh/) to manage your Node installation.

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

You now have a working Hello World app, private to you and visible in your live [Zapier editor](https://zapier.com/app/editor)!

```bash
# run the local tests
npm test

# validate the app
zapier validate
```

From this point on, you should feel comfortable to modify and update your app.


## Project Structure

In your `helloworld` folder, you should see this general structure:

```
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


## TODO!

More to come.
