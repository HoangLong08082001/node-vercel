const express = require("express");
const { getAllNotification } = require("./NotificationSystemController");
const router = express.Router();

module.exports = function NotificationSytemRoutes(app) {
  router.get("/get-all", getAllNotification);
  app.use("/nofitication", router);
};
