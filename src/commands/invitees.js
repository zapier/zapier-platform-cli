const makeAccess = require('./_access');

const invitees = makeAccess('invitee');
invitees.help = 'Manage the invitees/testers on your project. Can optionally --delete.';
invitees.example = 'zapier invitees [john@example.com]';
invitees.docs = `\
### TODO!

This is markdown documentation.
`;

module.exports = invitees;
