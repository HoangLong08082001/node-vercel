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
    (req, res, next) => {
      req.app.set(
        "name",
        `Lấy danh sách team theo mã cộng tác viên ${req.params.id}`
      );
      next();
    },
    getAllTeam
  );
  router.post(
    "/create",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Tạo team mới");
      next();
    },
    createTeam
  );
  router.post(
    "/join",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Tham gia nhóm");
      next();
    },
    joinTeam
  );
  router.get(
    "/all-collaborator/:id",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Lấy danh sách các cộng tác viên trong team");
      next();
    },
    getAllCollaboratorOfTeam
  );
  router.get(
    "/detail-collaborator/:id",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Xem thông tin chi tiết cộng tác viên trong team");
      next();
    },
    detailCollaborator
  );
  return app.use("/team", router);
}
module.exports = TeamRoutes;
