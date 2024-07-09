const { authenticationToken } = require("../../middleware/JwtAction");
const setName = require("../../middleware/setName");
const readLog = require("../logs/Logs");
const {
  blockEmployee,
  createEmployee,
  deleteEmployee,
  getAllEmployee,
  loginEmployee,
  rePassword,
  setNewPassword,
  sendMailToLogin,
  changePasswordEmployee,
  updateInformation,
} = require("./EmployeeController");

const express = require("express");
const router = express.Router();
module.exports = function EmployeeRoutes(app) {
  router.use(readLog);
  router.post(
    "/create",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Tạo tài khoản mới nhân viên truy cập hệ thống");
      next();
    },
    (req, res) => createEmployee(req, res, req.app.get("io"))
  );
  router.get(
    "/get-all",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Lấy danh sách nhân viên hệ thống");
      next();
    },
    getAllEmployee
  );
  router.post("/login", loginEmployee);
  router.put(
    "/re-password",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Tạo mật khẩu mới");
      next();
    },
    rePassword
  );
  router.put(
    "/renew-password",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Tạo mật khẩu mới");
      next();
    },
    setNewPassword
  );
  router.post(
    "/block",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Khoá tài khoản nhân viên hệ thống");
      next();
    },
    blockEmployee
  );
  router.post("/send-mail-to-login", authenticationToken, sendMailToLogin);
  router.put(
    "/update",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Cập nhật mới thông tin cá nhân");
      next();
    },
    updateInformation
  );
  return app.use("/employee", router);
};
