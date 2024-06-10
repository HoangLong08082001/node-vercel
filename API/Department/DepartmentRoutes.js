import {
  checkPermission,
  createDepartment,
  getAlDepartment,
  getDepartmentWithRule,
} from "./DepartmentConrtoller";

const express = require("express");
const router = express.Router();
export default function DepartmentRoutes(app) {
  router.post("/create", createDepartment);
  router.get(
    "/get-all",
    app.set("name", "get-all-department"),
    getAlDepartment
  );
  router.get("/get-with-rule", getDepartmentWithRule);
  router.post("/check-permission", checkPermission);
  return app.use("/department", router);
}
