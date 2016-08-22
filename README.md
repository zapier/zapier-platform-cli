# Introduction

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
```

Your Zapier CLI should be installed and ready to go at this point. Next up, we'll create our first app!

```bash
# create your first app
mkdir helloworld
cd helloworld
zapier init --template=helloworld
npm install
```

You should now have a working local app, you can run several local commands to try it out.

```bash
# validate the app
zapier validate

# describe the app
zapier describe

# run the local tests
zapier test
```

Next, you'll probably want to register your app and upload your version to Zapier itself so you can start testing live.

```bash
# register and push your app & version to Zapier
zapier register "Hello World"
zapier push

# list your apps
zapier apps

# list your versions
zapier versions
```

If you open the editor in Zapier, you should now see "Hello World (1.0.0)" listed and usable! We recommend using our built in watch command to iterate on the app.

```bash
# watch and sync up your local app to zapier
zapier watch
# now make changes locally, and see them reflected live in Zapier
# method calls will also be proxied and logged to stdout for convenience
```

Don't forget you'll need to `zapier push` to make your changes stick after `zapier push`!


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


## Apps & Versions

TODO.


## Authentication

TODO.


## Models

TODO.


## Triggers/Searches/Writes

TODO.


## Making Requests

TODO.

