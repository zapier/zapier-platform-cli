const makeAccess = require('./_access');

const collaborate = makeAccess('collaborate', 'collaborator');
collaborate.help = 'Manage the collaborators on your project. Can optionally --remove.';
collaborate.example = 'zapier collaborate [user@example.com]';
collaborate.docs = `\
Give any user registered on Zapier the ability to collaborate on your app. Commonly, this is useful for teammates, contractors or other developers who might want to make changes on your app. Only admin access is supported. If you'd only like to provide read-only or testing access, try \`zapier invite\`.

**Options**

* _none_ -- print a table of all collaborators
* \`[user@example.com]\` -- the user to add or remove
* \`--remove\` -- optionally elect to remove this user, default false
* \`--help\` -- prints this help text, same as \`zapier help collaborate\`

${'```'}bash
$ zapier collaborate
# The collaborators on your app "Example" listed below.
# 
# ┌──────────────────┬───────┬──────────┐
# │ Email            │ Role  │ Status   │
# ├──────────────────┼───────┼──────────┤
# │ user@example.com │ admin │ accepted │
# └──────────────────┴───────┴──────────┘

$ zapier collaborate user@example.com
# Preparing to add collaborator user@example.com to your app "Example".
# 
#   Adding user@example.com - done!
# 
# Collaborators updated! Try viewing them with \`zapier collaborate\`.

$ zapier collaborate user@example.com --remove
# Preparing to remove collaborator user@example.com from your app "Example".
# 
#   Removing user@example.com - done!
# 
# Collaborators updated! Try viewing them with \`zapier collaborate\`.
${'```'}
`;

module.exports = collaborate;
