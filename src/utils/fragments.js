const defaultOptionsDocFragment = ({
  cmd = 'cmd'
} = {}) => {
  return `\
* \`--help\` -- prints this help text, same as \`zapier help ${cmd}\`
* \`--debug\` -- print debug API calls and tracebacks\
`;
};

module.exports = {
  defaultOptionsDocFragment
};
