"use strict";

module.exports = [
  {
    method: "GET",
    path: "/location",
    options: {
      handler: async (request, h) => {
        try {
          return h.response(request.location);
        } catch (error) {
          return h.response({ error: error.message });
        }
      },
    },
  },
];
