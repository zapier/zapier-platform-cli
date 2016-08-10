const defaultOptionsDocFragment = ({
  cmd = 'cmd'
} = {}) => {
  return `\
* \`--format={plain|raw|row|table}\` -- display format, default is \`table\`
* \`--help\` -- prints this help text, same as \`zapier help ${cmd}\`
* \`--debug\` -- print debug API calls and tracebacks\
`;
};

module.exports = {
  defaultOptionsDocFragment
};
