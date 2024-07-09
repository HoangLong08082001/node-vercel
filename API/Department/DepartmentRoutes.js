const { authenticationToken } = require("../../middleware/JwtAction");
const readLog = require("../logs/Logs");
const {
  checkPermission,
  createDepartment,
  getAlDepartment,
  getDepartmentWithRule,
} = require("./DepartmentConrtoller");

const express = require("express");
const router = express.Router();
module.exports = function DepartmentRoutes(app) {
  router.use(readLog);
  router.post(
    "/create",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Tạo mới vị trí truy cập hệ thống");
      next();
    },
    createDepartment
  );
  router.get(
    "/get-all",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Lấy danh sách vị trí truy cập hệ thống");
      next();
    },
    getAlDepartment
  );
  router.get("/get-with-rule", authenticationToken, getDepartmentWithRule);
  router.post(
    "/check-permission",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Phân quyền cho vị trí truy cập hệ thống");
      next();
    },
    checkPermission
  );
  return app.use("/department", router);
};
