"use strict";
const jwt = require("jsonwebtoken");
const joi = require("joi").extend(require("@hapi/joi-date"));

module.exports = {
  method: "GET",
  path: "/customer/getOrders/{id}",
  options: {
    description: "get orders of customer with id",
    tags: ["api"],
    validate: {
      params: joi.object({
        id: joi.number().required(),
      }),
    },
  },
  handler: async (request, h) => {
    try {
      const { Order } = request.server.models();
      const { Customer } = request.server.models();

      const customer_id = request.params.id;

      //getting token for jwt verification
      const customer = await Customer.query().findOne({ id: customer_id });
      if (!customer) {
        return h.response({ error: "customer doesn't exist" }).code(404);
      }
      const token = customer.token;
      //checks weather the user is logged in or not
      if (!token) {
        return h.response({ error: "customer is not logged in." }).code(400);
      }

      //verifying token
      const data = jwt.verify(token, "HelloTeam");
      if (data._id != customer_id) {
        return h.response({ error: "user is not authenticated" });
      }

      //as customer is authenticated you can get orders
      const orders = await Order.query()
        .select("total")
        .where("customer_id", "=", customer_id);
      if (orders.length === 0) {
        return h.response({ error: "customers doesn't have any orders" });
      }
      return h.response(orders);
    } catch (error) {
      return h.response({ error: error.message }).code(500);
    }
  },
};
