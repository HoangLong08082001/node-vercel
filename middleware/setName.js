const setName = (name) => {
  return (req, res, next) => {
    req.routeName = name;
    next();
  };
};

module.exports = setName;
