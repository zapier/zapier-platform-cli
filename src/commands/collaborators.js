const makeAccessCmd = require('./_access');

const collaboratorsCmd = makeAccessCmd('collaborator');
collaboratorsCmd.help = 'Manage the collaborators on your project. Can optionally --delete.';
collaboratorsCmd.example = 'zapier collaborators [john@example.com]';

module.exports = collaboratorsCmd;
