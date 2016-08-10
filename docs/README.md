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

