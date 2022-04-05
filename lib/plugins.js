const Schwifty = require("@hapipal/schwifty");
const { knexSnakeCaseMappers } = require("objection");
const jwt = require("hapi-auth-jwt2");

module.exports = [
  {
    plugin: Schwifty,
    options: {
      knex: {
        client: "mysql2",
        connection: {
          host: "127.0.0.1",
          port: "3306",
          user: "root",
          password: "Shubham",
          database: "hapiPal",
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
];
