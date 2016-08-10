const makeAccess = require('./_access');

const invite = makeAccess('invite', 'invitee');
invite.help = 'Manage the invitees/testers on your project. Can optionally --delete.';
invite.example = 'zapier invite [user@example.com]';
invite.docs = `\
**TODO!**

This is markdown documentation.
`;

module.exports = invite;
