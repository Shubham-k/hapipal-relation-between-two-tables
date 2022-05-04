const joi = require("joi").extend(require("@hapi/joi-date"));

const schema1 = joi.object({
  firstName: joi.string().min(3).max(30).required(),
  lastName: joi.string().min(3).max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().min(7).max(100).required(),
  confirmPassword: joi.string().min(7).max(100).required(),
});

const schema2 = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(7).max(100).required(),
});

module.exports = { schema1, schema2 };
