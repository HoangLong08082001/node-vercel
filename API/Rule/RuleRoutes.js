import { CraeteRule, GetRule, UpdateRule, DeleteRule } from "./RuleController";

const express = require("express");
const router = express.Router();
export default function RuleRoute(app) {
  router.post("/create", CraeteRule);
  router.get("/", GetRule);
  router.put("/update", UpdateRule);
  router.delete("/delete", DeleteRule);
  return app.use("/rule", router);
}
