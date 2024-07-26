const express = require("express");
const {
  getTotalStatis,
  getTotalArea,
  getTotalBar,
  getTotalByIdCollaborator,
  getTotalAreaByIdCollaborator,
  getTotalBarByIdCollaborator,
} = require("./DashboardController");
const { authenticationToken } = require("../../middleware/JwtAction");
const router = express.Router();
module.exports = function DashboardRoutes(app) {
  router.get("/get-total", authenticationToken, getTotalStatis);
  router.get("/get-total-area", authenticationToken, getTotalArea);
  router.get("/get-total-bar", authenticationToken, getTotalBar);
  router.get("/get-total/:id", authenticationToken, getTotalByIdCollaborator);
  router.get(
    "/get-total-area/:id",
    authenticationToken,
    getTotalAreaByIdCollaborator
  );
  router.get(
    "/get-total-bar/:id",
    authenticationToken,
    getTotalBarByIdCollaborator
  );
  app.use("/dashboard", router);
};
