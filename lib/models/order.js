const { Model } = require("@hapipal/schwifty");
const joi = require("joi").extend(require("@hapi/joi-date"));

module.exports = class Order extends Model {
  static get tableName() {
    return "orders";
  }

  // static get customerIdColumn() {
  //   return "customer_id ";
  // }

  static get joiSchema() {
    return joi.object({
      customerId: joi.number().integer(),
      total: joi.number(),
    });
  }
};
