const { authenticationToken } = require("../../middleware/JwtAction");
const setName = require("../../middleware/setName");
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
  router.post("/create", (req, res) =>
    createEmployee(req, res, req.app.get("io"))
  );
  router.get(
    "/get-all",

    app.set("name", "get-all-employee"),
    getAllEmployee
  );
  router.post("/login", loginEmployee);
  router.put("/re-password", rePassword);
  router.put("/renew-password", setNewPassword);
  router.post("/block", blockEmployee);
  router.post("/send-mail-to-login", sendMailToLogin);
  router.put("/update", updateInformation);
  return app.use("/employee", router);
};
