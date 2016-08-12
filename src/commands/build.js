const constants = require('../constants');
const utils = require('../utils');

var build = (context) => {
  context.line('Building project.\n');
  return utils.build()
    .then(() => {
      context.line(`\nBuild complete! Moved to ${constants.BUILD_PATH}! Try the \`zapier upload\` command now.`);
    });
};
build.argsSpec = [];
build.argOptsSpec = {};
build.help = 'Builds a deployable zip from the current directory.';
build.example = 'zapier build';
build.docs = `\
Builds a ready to upload zip file, does not upload now deploy the zip file. Generally you'd use \`zapier push\` which does this and \`zapier upload\` together.

It does the following steps:

* Creates a temporary folder
* Copies all code into the temporary folder
* Adds an entry point \`zapierwrapper.js\`
* Generates and validates app definition.
* Detects dependencies via browserify (optional)
* Zips up all needed \`.js\` files
* Moves the zip to \`${constants.BUILD_PATH}\`

> If you get live errors like \`Error: Cannot find module 'some-path'\`, try disabling dependency detection.

**Arguments**

* \`--disable-dependency-detection\` -- disables walking required files to slim the build

${'```'}bash
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
${'```'}
`;

module.exports = build;
