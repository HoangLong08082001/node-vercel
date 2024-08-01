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
    (req, res, next) => {
      req.app.set("name", "Tạo tài khoản mới nhân viên truy cập hệ thống");
      next();
    },
    authenticationToken,
    (req, res) => createEmployee(req, res, req.app.get("io"))
  );
  router.get("/get-all", authenticationToken, getAllEmployee);
  router.post(
    "/login",
    (req, res, next) => {
      req.app.set("name", "Nhân viên truy cập hệ thống");
      next();
    },
    loginEmployee
  );
  router.put(
    "/re-password",
    (req, res, next) => {
      req.app.set(
        "name",
        `${req.body.email} yêu cầu gửi mail cấp lại mật khẩu mới`
      );
      next();
    },
    rePassword
  );
  router.put(
    "/renew-password",
    (req, res, next) => {
      req.app.set("name", `${req.body.email} thay đổi mật khẩu mới`);
      next();
    },
    authenticationToken,
    setNewPassword
  );
  router.post(
    "/block",
    (req, res, next) => {
      req.app.set("name", "Khoá tài khoản nhân viên hệ thống");
      next();
    },
    authenticationToken,
    blockEmployee
  );
  router.post("/send-mail-to-login", authenticationToken, sendMailToLogin);
  router.put(
    "/update",
    (req, res, next) => {
      req.app.set("name", `${req.body.email} cập nhật mới thông tin cá nhân`);
      next();
    },
    authenticationToken,
    updateInformation
  );
  return app.use("/employee", router);
};
