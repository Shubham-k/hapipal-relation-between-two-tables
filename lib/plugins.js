const Schwifty = require("@hapipal/schwifty");
const { knexSnakeCaseMappers } = require("objection");
const jwt = require("hapi-auth-jwt2");
const hapiSwagger = require("hapi-swagger");
const inert = require("@hapi/inert");
const vision = require("@hapi/vision");

module.exports = [
  inert,
  vision,
  {
    plugin: Schwifty,
    options: {
      knex: {
        client: "mysql2",
        connection: {
          host: "127.0.0.1",
          port: "3306",
          user: "root",
          password: "root",
          database: "hapipal",
          waitForConnections: true,
          connectionLimit: 100,
          queueLimit: 0,
          typeCast(field, next) {
            if (field.type === "TINY" && field.length === 1) {
              return field.string() === "1";
            }

            return next();
          },
        },
        pool: { min: 5, max: 100 },
        ...knexSnakeCaseMappers(),
      },
    },
  },
  {
    plugin: require("hapi-geo-locate"),
    options: {
      enabledByDefault: true,
    },
  },
  {
    plugin: jwt,
    options: {
      key: "HelloTeam",
      verifyOptions: { algorithms: ["HS256"] },
    },
  },
  {
    plugin: hapiSwagger,
    options: {
      info: {
        title: "API DOCUMENTATION",
        version: "1.0",
      },
    },
  },
];
