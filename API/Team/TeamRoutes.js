const express = require("express");
const { getAllTeam, createTeam, joinTeam } = require("./TeamController.js");
const router = express.Router();
function TeamRoutes(app) {
  router.get("/all-team/:id", getAllTeam);
  router.post("/create", createTeam);
  router.post("/join", joinTeam);
  return app.use("/team", router);
}
module.exports = TeamRoutes;
