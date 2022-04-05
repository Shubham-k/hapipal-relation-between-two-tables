const jwt = require("jsonwebtoken");

const generateAuthToken = async (id) => {
  const token = jwt.sign({ _id: id }, "HelloTeam");
  return token;
};

module.exports = {
  generateAuthToken,
};
