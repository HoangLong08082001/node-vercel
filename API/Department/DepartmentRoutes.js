import {
  createDepartment,
  getAlDepartment,
  getDepartmentWithRule,
} from "./DepartmentConrtoller";

const express = require("express");
const router = express.Router();
export default function DepartmentRoutes(app) {
  router.post("/create", createDepartment);
  router.get("/get-all", getAlDepartment);
  router.get("/get-with-rule", getDepartmentWithRule);
  return app.use("/department", router);
}
