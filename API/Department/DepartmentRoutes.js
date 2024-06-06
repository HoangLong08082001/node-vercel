import { createDepartment, getAlDepartment } from "./DepartmentConrtoller";

const express = require("express");
const router = express.Router();
export default function DepartmentRoutes(app) {
  router.post("/create", createDepartment);
  router.get("/get-all", getAlDepartment);
  return app.use("/department", router);
}
