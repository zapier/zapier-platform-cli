var inviteesCmd = () => {
  return Promise.resolve('todo');
};
inviteesCmd.help = 'Manage the invitees/testers on your project.';
inviteesCmd.example = 'zapier invitees [john@example.com]';


module.exports = inviteesCmd;
