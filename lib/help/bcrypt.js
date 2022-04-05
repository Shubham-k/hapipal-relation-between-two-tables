const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 8);
  return hashedPassword;
};

const matchPassword = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

module.exports = {
  hashPassword,
  matchPassword,
};
