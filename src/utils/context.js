const createContext = () => {
  return {
    line: (_line) => console.log(_line)
  };
};

module.exports = {
  createContext,
};
