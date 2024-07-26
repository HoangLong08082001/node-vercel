const { authenticationToken } = require("../../middleware/JwtAction");
const readLog = require("../logs/Logs");
const {
  checkPermission,
  createDepartment,
  getAlDepartment,
  getDepartmentWithRule,
  handleBlock,
} = require("./DepartmentConrtoller");

const express = require("express");
const router = express.Router();
module.exports = function DepartmentRoutes(app) {
  router.use(readLog);
  router.post(
    "/create",
    (req, res, next) => {
      req.app.set("name", "Tạo mới vị trí truy cập hệ thống");
      next();
    },
    authenticationToken,
    createDepartment
  );
  router.get(
    "/get-all",
    authenticationToken,
    getAlDepartment
  );
  router.get("/get-with-rule", authenticationToken, getDepartmentWithRule);
  router.post(
    "/check-permission",
    (req, res, next) => {
      req.app.set("name", "Phân quyền cho vị trí truy cập hệ thống");
      next();
    },
    authenticationToken,
    checkPermission
  );
  router.put("/block/:id", authenticationToken, handleBlock);
  return app.use("/department", router);
};
