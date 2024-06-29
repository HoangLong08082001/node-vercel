const express = require("express");
const {
  getAllTeam,
  createTeam,
  joinTeam,
  getAllCollaboratorOfTeam,
  detailCollaborator,
} = require("./TeamController.js");
const router = express.Router();
function TeamRoutes(app) {
  router.get("/all-team/:id", getAllTeam);
  router.post("/create", createTeam);
  router.post("/join", joinTeam);
  router.get("/all-collaborator/:id", getAllCollaboratorOfTeam);
  router.get("/detail-collaborator/:id", detailCollaborator);
  return app.use("/team", router);
}
module.exports = TeamRoutes;
