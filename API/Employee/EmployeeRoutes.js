import {
  createEmployee,
  getAllEmployee,
  loginEmployee,
  rePassword,
  setNewPassword,
} from "./EmployeeController";

const express = require("express");
const router = express.Router();
export default function EmployeeRoutes(app) {
  router.post("/create", createEmployee);
  router.get("/get-all", getAllEmployee);
  router.post("/login", loginEmployee);
  router.put("/re-password", rePassword);
  router.put("/renew-password", setNewPassword);
  return app.use("/employee", router);
}
