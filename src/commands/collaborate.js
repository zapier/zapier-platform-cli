const makeAccess = require('./_access');

const collaborate = makeAccess('collaborate', 'collaborator');
collaborate.help = 'Manage the collaborators on your project. Can optionally --delete.';
collaborate.example = 'zapier collaborate [john@example.com]';
collaborate.docs = `\
**TODO!**

${'```'}bash
$ zapier collaborate john@example.com
${'```'}
`;

module.exports = collaborate;
