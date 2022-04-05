const { Model } = require("@hapipal/schwifty");
const joi = require("joi").extend(require("@hapi/joi-date"));
const Order = require("./order");

module.exports = class Customer extends Model {
  static get tableName() {
    return "customers";
  }

  static get idColumn() {
    return "id";
  }

  static get joiSchema() {
    return joi.object({
      firstName: joi.string().min(3).max(30).required(),
      lastName: joi.string().min(3).max(30).required(),
      email: joi.string().email().required(),
      password: joi.string().min(7).max(100).required(),
      confirmPassword: joi.string().min(7).max(100).required(),
      token: joi.string().max(300).allow(null),
    });
  }

  static relationMappings = {
    orders: {
      relation: Model.HasManyRelation,
      modelClass: Order,
      join: {
        from: "customers.id",
        to: "orders.customerId",
      },
    },
  };
};
