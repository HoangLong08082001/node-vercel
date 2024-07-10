const express = require("express");
const {
  codeVerify,
  deleteCollaborator,
  getAccount,
  getAllCollaborator,
  getById,
  loginAccount,
  presenterPhone,
  reNewpassword,
  registerAccount,
  resendCodeVerify,
  setStatus,
  signOutAccount,
  updateInformation,
  sendEmailVerifyCode,
  newPass,
} = require("./CollaboratorController");
const { authenticationToken } = require("../../middleware/JwtAction");
const readLog = require("../logs/Logs");
const router = express.Router();
module.exports = function CollaboratorRoute(app) {
  router.use(readLog);
  router.post(
    "/register",
    (req, res, next) => {
      req.app.set("name", "Đăng ký tài khoản mới");
      next();
    },
    registerAccount
  );
  router.post(
    "/login",
    (req, res, next) => {
      req.app.set("name", "Đăng nhập");
      next();
    },
    loginAccount
  );
  router.post(
    "/logout",
    (req, res, next) => {
      req.app.set("name", "Đăng xuất");
      next();
    },
    signOutAccount
  );
  router.post(
    "/verify",
    (req, res, next) => {
      req.app.set("name", "Xác minh tài khoản");
      next();
    },
    codeVerify
  );
  router.post(
    "/presenter-phone",
    (req, res, next) => {
      req.app.set("name", "Nhập số điện thoại người giới thiệu");
      next();
    },
    presenterPhone
  );
  router.get(
    "/account",
    (req, res, next) => {
      req.app.set("name", "Đăng xuất");
      next();
    },
    getAccount
  );
  router.put(
    "/update-collaborator",
    (req, res, next) => {
      req.app.set("name", "Cập nhật thông tin");
      next();
    },
    authenticationToken,
    updateInformation
  );
  router.post(
    "/renew-password",
    (req, res, next) => {
      req.app.set("name", "Làm mới mật khẩu");
      next();
    },
    reNewpassword
  );
  router.post(
    "/resend",
    (req, res, next) => {
      req.app.set("name", "Nhấn nút gửi lại mã xác minh");
    },
    authenticationToken,
    resendCodeVerify
  );
  router.get(
    "/get-all",
    (req, res, next) => {
      req.app.set("name", "Lấy danh sách cộng tác viên");
      next();
    },
    authenticationToken,
    getAllCollaborator
  );
  router.delete(
    "/delete/:id",
    (req, res, next) => {
      req.app.set("name", "Xoá cộng tác viên");
      next();
    },
    authenticationToken,
    deleteCollaborator
  );
  router.post(
    "/block",
    (req, res, next) => {
      req.app.set("name", "Khoá người dùng");
      next();
    },
    authenticationToken,
    setStatus
  );
  router.get("/get-by-id/:id", authenticationToken, getById);
  router.post("/send-email", sendEmailVerifyCode);
  router.put(
    "/renew-password",
    (req, res, next) => {
      req.app.set("name", "Tạo lại mật khẩu mới");
      next();
    },
    newPass
  );
  return app.use("/collaborator", router);
};
