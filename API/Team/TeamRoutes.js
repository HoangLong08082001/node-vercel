const express = require("express");
const {
  getAllTeam,
  createTeam,
  joinTeam,
  getAllCollaboratorOfTeam,
  detailCollaborator,
} = require("./TeamController.js");
const { authenticationToken } = require("../../middleware/JwtAction.js");
const readLog = require("../logs/Logs.js");
const router = express.Router();
function TeamRoutes(app) {
  router.use(readLog);
  router.get(
    "/all-team/:id",
    authenticationToken,
    getAllTeam
  );
  router.post(
    "/create",
    authenticationToken,
    createTeam
  );
  router.post(
    "/join",
    authenticationToken,
    joinTeam
  );
  router.get(
    "/all-collaborator/:id",
    authenticationToken,
    getAllCollaboratorOfTeam
  );
  router.get(
    "/detail-collaborator/:id",
    authenticationToken,
    detailCollaborator
  );
  return app.use("/team", router);
}
module.exports = TeamRoutes;
