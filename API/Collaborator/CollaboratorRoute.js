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
} = require("./CollaboratorController");
const { authenticationToken } = require("../../middleware/JwtAction");
const router = express.Router();
module.exports = function CollaboratorRoute(app) {
  router.post(
    "/register",
    app.set("name", "Đăng ký tài khoản mới"),
    registerAccount
  );
  router.post("/login", app.set("name", "Đăng nhập"), loginAccount);
  router.post("/logout", app.set("name", "Đăng xuất"), signOutAccount);
  router.post("/verify", app.set("name", "Xác minh tài khoản"), codeVerify);
  router.post(
    "/presenter-phone",
    app.set("name", "Nhập số điện thoại người dùng"),
    presenterPhone
  );
  router.get("/account", app.set("name", "Đăng xuất"), getAccount);
  router.put(
    "/update-collaborator",
    app.set("name", "Cập nhật thông tin"),
    updateInformation
  );
  router.post(
    "/renew-password",
    app.set("name", "Làm mới mật khẩu"),
    reNewpassword
  );
  router.post(
    "/resend",
    app.set("name", "Nhấn nút gửi lại mã xác minh"),
    resendCodeVerify
  );
  router.get(
    "/get-all",
    app.set("name", "Lấy danh sách cộng tác viên"),
    getAllCollaborator
  );
  router.delete(
    "/delete",
    app.set("name", "Xoá cộng tác viên"),
    deleteCollaborator
  );
  router.post("/block", app.set("name", "Khoá người dùng"), setStatus);
  router.get("/get-by-id/:id", getById);
  router.post("/send-email", sendEmailVerifyCode);
  return app.use("/collaborator", router);
};
