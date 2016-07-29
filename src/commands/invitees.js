const makeAccessCmd = require('./_access');

const inviteesCmd = makeAccessCmd('invitee');
inviteesCmd.help = 'Manage the invitees/testers on your project. Can optionally --delete.';
inviteesCmd.example = 'zapier invitees [john@example.com]';
inviteesCmd.docs = `\
# TODO!

This is markdown documentation.
`;

module.exports = inviteesCmd;
