"use strict";

const passwordWork = require("../help/bcrypt");

const joi = require("joi").extend(require("@hapi/joi-date"));

//requiring jwt functionality
const jwt = require("../help/jwt");
const jwt2 = require("jsonwebtoken");

//for validating
const joiValidate = require("../ValidateSchema/customer");

module.exports = [
  //this route is creating a profile of a customer
  {
    method: "POST",
    path: "/customer",
    options: {
      description: "create customer's profile",
      tags: ["api"],
      validate: {
        payload: joiValidate.schema1,
      },
    },
    handler: async (request, h) => {
      if (request.payload.password === request.payload.confirmPassword) {
        const hashedPassword = await passwordWork.hashPassword(
          request.payload.password
        );
        try {
          const { Customer } = request.server.models();
          const customer = await Customer.query().insert({
            firstName: request.payload.firstName,
            lastName: request.payload.lastName,
            email: request.payload.email,
            password: hashedPassword,
            confirmPassword: hashedPassword,
          });
          const { password, confirmPassword, ...newCustomer } = customer;
          newCustomer.message = "your account is created";
          return h.response(newCustomer);
        } catch (error) {
          return h.response({ error: error.message });
        }
      }
      return h.response({ error: "credentials didn't matched!" }).code(400);
    },
  },

  //reading customer with id
  {
    method: "GET",
    path: "/customer/{id}",
    options: {
      description: "get customer's profile with id",
      tags: ["api"],
      validate: {
        params: joi.object({
          id: joi.number().required(),
        }),
      },
    },
    handler: async (request, h) => {
      const { Customer } = request.server.models();
      try {
        const _id = request.params.id;
        const customer = await Customer.query().findById(_id);
        if (!customer) {
          return h.response({ error: "customer doesn't exist" }).code(404);
        }
        const { password, confirmPassword, ...newCustomer } = customer;
        return h.response(newCustomer);
      } catch (error) {
        return h.response({ error: error.message }).code(500);
      }
    },
  },

  //updating route with the help of id
  {
    method: "PATCH",
    path: "/customer/{id}",
    options: {
      description: "updating customer's profile with id",
      tags: ["api"],
      validate: {
        params: joi.object({
          id: joi.number().required(),
        }),
        payload: joiValidate.schema1,
      },
    },
    handler: async (request, h) => {
      try {
        let hashedPassword;
        const { Customer } = request.server.models();
        const _id = request.params.id;

        const customer = await Customer.query().findOne({ id: _id });
        if (!customer) {
          return h.response({ error: "customer doesn't exist" }).code(404);
        }
        const token = customer.token;
        if (!token) {
          return h.response({ error: "customer is not logged in." }).code(400);
        }

        const data = jwt2.verify(token, "HelloTeam");
        if (data._id != _id) {
          return h.response({ error: "user is not authenticated" });
        }

        if (request.payload.password) {
          if (!request.payload.confirmPassword) {
            return h.response({
              message: "please confirm your password too.",
            });
          } else if (
            request.payload.password !== request.payload.confirmPassword
          ) {
            return h.response({ error: "credentials didn't matched!" });
          }
          hashedPassword = await passwordWork.hashPassword(
            request.payload.password
          );
        }
        const updates = request.payload;
        if (updates.password && updates.confirmPassword) {
          updates.password = hashedPassword;
          updates.confirmPassword = hashedPassword;
        }
        const updatedCustomer = await Customer.query().patchAndFetchById(
          _id,
          updates
        );
        if (!updatedCustomer) {
          return h.response({ error: "Customer does't exist" }).code(404);
        }
        const { password, confirmPassword, ...newCustomer } = updatedCustomer;
        return h.response(newCustomer);
      } catch (error) {
        return h.response({ error: error.message }).code(500);
      }
    },
  },

  //deleting customer with id
  {
    method: "DELETE",
    path: "/customer/{id}",
    options: {
      description: "deleting customer's profile with id",
      tags: ["api"],
      validate: {
        params: joi.object({
          id: joi.number().required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { Customer } = request.server.models();
        const _id = request.params.id;

        const customer = await Customer.query().findOne({ id: _id });
        if (!customer) {
          return h.response({ error: "customer doesn't exist" }).code(404);
        }
        const token = customer.token;
        if (!token) {
          return h.response({ error: "customer is not logged in." }).code(400);
        }

        //verifying token
        const data = jwt2.verify(token, "HelloTeam");
        if (data._id != _id) {
          return h.response({ error: "user is not authenticated" });
        }

        const deletedCustomer = await Customer.query().deleteById(_id);
        return h.response({ message: "your account has been deleted!" });
      } catch (error) {
        return h.response({ error: error.message }).code(500);
      }
    },
  },

  //login route which require email and password
  {
    method: "POST",
    path: "/customer/login",
    options: {
      description: "login customer's profile with email and password",
      tags: ["api"],
      validate: {
        payload: joiValidate.schema2,
      },
    },
    handler: async (request, h) => {
      try {
        if (!request.payload.password) {
          return h.response({ error: "password is required." });
        }
        const { Customer } = request.server.models();
        const email = request.payload.email;
        let customer = await Customer.query().findOne({
          email: email,
        });
        if (!customer) {
          return h.response({ error: "customer does't exist!" }).code(404);
        }
        const isCustomer = await passwordWork.matchPassword(
          request.payload.password,
          customer.password
        );
        if (!isCustomer) {
          return h.response({ error: "wrong credentials!" }).code(400);
        }

        //the token we generate every time a customer loggedIn
        const Token = await jwt.generateAuthToken(customer.id);

        //updating the value of token in the database
        customer = await Customer.query().patchAndFetchById(customer.id, {
          token: Token,
        });

        //abstracting properties which we don't want to share with customer
        const { password, confirmPassword, token, ...newCustomer } = customer;

        //if customer is matched we have to add jwt to the database so that we can use it later
        return h.response(newCustomer);
      } catch (error) {
        return h.response({ error: error.message }).code(500);
      }
    },
  },

  //add an order for this customer
  {
    method: "POST",
    path: "/customer/addOrders/{id}",
    options: {
      description: "adds order for customer's with id",
      tags: ["api"],
      validate: {
        params: joi.object({
          id: joi.number().required(),
        }),
        payload: joi.object({
          total: joi.number().required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { Customer } = request.server.models();
        const customer_id = request.params.id;

        const customer = await Customer.query().findOne({ id: customer_id });
        if (!customer) {
          return h.response({ error: "customer doesn't exist" }).code(404);
        }
        const token = customer.token;
        if (!token) {
          return h.response({ error: "customer is not logged in." }).code(400);
        }

        //verifying token
        const data = jwt2.verify(token, "HelloTeam");
        if (data._id != customer_id) {
          return h.response({ error: "user is not authenticated" });
        }

        const dataOrder = request.payload;
        const order = await Customer.relatedQuery("orders")
          .for(customer_id)
          .insert(dataOrder);
        order.message = "order is added";
        return h.response(order);
      } catch (error) {
        return h.response({ error: error.message }).code(500);
      }
    },
  },

  //logout customer and will delete it's token
  {
    method: "PATCH",
    path: "/customer/logout",
    options: {
      description: "logout's customer's profile",
      tags: ["api"],
      validate: {
        payload: joi.object({
          email: joi.string().email().required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { Customer } = request.server.models();
        const email = request.payload.email;
        const customer = await Customer.query()
          .patch({ token: null })
          .where("email", "=", email);
        if (!customer) {
          return h.response({ error: "wrong credentials" }).code(404);
        }
        return h.response({ message: "logged out!" }).code(200);
      } catch (error) {
        return h.response({ error: error.message }).code(500);
      }
    },
  },
];
