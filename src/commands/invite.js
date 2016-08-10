const makeAccess = require('./_access');

const invite = makeAccess('invite', 'invitee');
invite.help = 'Manage the invitees/testers on your project. Can optionally --delete.';
invite.example = 'zapier invite [user@example.com]';
invite.docs = `\
Invite any user registered on Zapier to test your app. Commonly, this is useful for teammates, contractors or other team members who might want to make test, QA or view your apps. If you'd only like to provide admin access, try \`zapier collaborate\`.

**Options**

* \`[user@example.com]\` -- the user to add or remove
* \`--remove\` -- optionally elect to remove this user, default false
* \`--help\` -- prints this help text, same as \`zapier help invite\`

${'```'}bash
$ zapier invite user@example.com
# Preparing to add invitee user@example.com to your app "Example".
# 
#   Adding user@example.com - done!
# 
# Invitees updated! Try viewing them with \`zapier invite\`.

$ zapier invite user@example.com --remove
# Preparing to remove invitee user@example.com from your app "Example".
# 
#   Removing user@example.com - done!
# 
# Invitees updated! Try viewing them with \`zapier invite\`.
${'```'}
`;

module.exports = invite;
