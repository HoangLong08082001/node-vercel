const express = require("express");
const {
  getLink,
  updateLinks,
  addLinks,
  getFirstLink,
} = require("./LinkController");
const { authenticationToken } = require("../../middleware/JwtAction");
const router = express.Router();

module.exports = function LinkRoutes(app) {
  router.get("/get-link", authenticationToken, getLink);
  router.put("/update-link", authenticationToken, updateLinks);
  router.post("/add-link", authenticationToken, addLinks);
  router.get("/get-new-link", authenticationToken, getFirstLink);
  app.use("/link", router);
};
