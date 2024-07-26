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
    registerAccount
  );
  router.post(
    "/login",
    loginAccount
  );
  router.post("/logout", signOutAccount);
  router.post("/verify", codeVerify);
  router.post("/presenter-phone", presenterPhone);
  router.get("/account", getAccount);
  router.put(
    "/update-collaborator",
    authenticationToken,
    updateInformation
  );
  router.post(
    "/renew-password",
    reNewpassword
  );
  router.post(
    "/resend",
    authenticationToken,
    resendCodeVerify
  );
  router.get(
    "/get-all",
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
    newPass
  );
  return app.use("/collaborator", router);
};
