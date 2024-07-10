const { authenticationToken } = require("../../middleware/JwtAction");
const readLog = require("../logs/Logs");
const {
  CraeteRule,
  GetRule,
  UpdateRule,
  DeleteRule,
  handleBlock,
} = require("./RuleController");

const express = require("express");
const router = express.Router();
function RuleRoute(app) {
  router.use(readLog);
  router.post(
    "/create",
    (req, res, next) => {
      req.app.set("name", "Tạo quyền mới cho hệ thống");
      next();
    },
    authenticationToken,
    (req, res) => CraeteRule(req, res, req.app.get("io"))
  );
  router.get(
    "/get-all",
    (req, res, next) => {
      req.app.set("name", "Lấy tất cả các quyền của hệ thống");
      next();
    },
    authenticationToken,
    GetRule
  );
  router.put(
    "/update",
    (req, res, next) => {
      req.app.set("name", "Cập nhật thông tin quyền hệ thống");
      next();
    },
    authenticationToken,
    (req, res) => UpdateRule(req, res, req.app.get("io"))
  );
  router.delete(
    "/delete",
    (req, res, next) => {
      req.app.set("name", "Xoá quyền này khỏi hệ thống");
      next();
    },
    authenticationToken,
    DeleteRule
  );
  router.put('/block/:id', authenticationToken, handleBlock);
  return app.use("/rule", router);
}
module.exports = RuleRoute;
