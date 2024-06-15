const {
  repasswordPage,
  renewPassword,
  getSuccessPage,
} = require("../viewsPage/ControllerViews.js");
const express = require("express");
const router = express.Router();

function ViewRoutes(app) {
  router.get("/repassword-page", repasswordPage);
  router.post("/renew", renewPassword);
  router.get("/success-page", getSuccessPage);
  return app.use("/views", router);
}
module.exports = ViewRoutes;
