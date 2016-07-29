const makeAccess = require('./_access');

const collaborators = makeAccess('collaborator');
collaborators.help = 'Manage the collaborators on your project. Can optionally --delete.';
collaborators.example = 'zapier collaborators [john@example.com]';
collaborators.docs = `\
# TODO!

This is markdown documentation.
`;

module.exports = collaborators;
