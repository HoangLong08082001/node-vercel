const {
  CraeteRule,
  GetRule,
  UpdateRule,
  DeleteRule,
} = require("./RuleController");

const express = require("express");
const router = express.Router();
function RuleRoute(app) {
  router.post("/create", (req, res) => CraeteRule(req, res, req.app.get("io")));
  router.get("/get-all", GetRule);
  router.put("/update", (req, res) => UpdateRule(req, res, req.app.get("io")));
  router.delete("/delete", DeleteRule);
  return app.use("/rule", router);
}
module.exports = RuleRoute;
