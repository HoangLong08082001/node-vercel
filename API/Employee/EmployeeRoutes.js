import { authenticationToken } from "../../middleware/JwtAction";
import setName from "../../middleware/setName";
import {
  blockEmployee,
  createEmployee,
  deleteEmployee,
  getAllEmployee,
  loginEmployee,
  rePassword,
  setNewPassword,
} from "./EmployeeController";

const express = require("express");
const router = express.Router();
export default function EmployeeRoutes(app) {
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
  return app.use("/employee", router);
}
