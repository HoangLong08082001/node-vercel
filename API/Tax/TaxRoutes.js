const express = require("express");
const { authenticationToken } = require("../../middleware/JwtAction");
const { getAll } = require("./TaxController");
const router = express.Router();
module.exports = function TaxRoutes(app) {
  router.get("/get-all", authenticationToken, getAll);
  return app.use("/tax", router);
};
