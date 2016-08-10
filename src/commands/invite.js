const utils = require('../utils');

const makeAccess = require('./_access');

const invite = makeAccess('invite', 'invitee');
invite.help = 'Manage the invitees/testers on your project. Can optionally --remove.';
invite.example = 'zapier invite [user@example.com]';
invite.docs = `\
Invite any user registered on Zapier to test your app. Commonly, this is useful for teammates, contractors or other team members who might want to make test, QA or view your apps. If you'd only like to provide admin access, try \`zapier collaborate\`.

**Options**

* _none_ -- print a table of all invitees
* \`[user@example.com]\` -- the user to add or remove
* \`--remove\` -- optionally elect to remove this user, default false
${utils.defaultOptionsDocFragment({cmd: 'invite'})}

${'```'}bash
$ zapier invite
# The invitees on your app "Example" listed below.
# 
# ┌──────────────────┬─────────┬──────────┐
# │ Email            │ Role    │ Status   │
# ├──────────────────┼─────────┼──────────┤
# │ user@example.com │ invitee │ accepted │
# └──────────────────┴─────────┴──────────┘

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
