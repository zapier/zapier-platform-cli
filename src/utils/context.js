const createContext = ({ command, args, argOpts } = {}) => {
  return {
    command,
    args,
    argOpts,
    line: _line => {
      // throwing in extra text makes output invalid json
      if (argOpts.format !== 'json') {
        console.log(_line || '');
      }
    }
  };
};

module.exports = {
  createContext
};
