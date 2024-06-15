const {
  checkPermission,
  createDepartment,
  getAlDepartment,
  getDepartmentWithRule,
} = require("./DepartmentConrtoller");

const express = require("express");
const router = express.Router();
module.exports = function DepartmentRoutes(app) {
  router.post("/create", createDepartment);
  router.get(
    "/get-all",
    app.set("name", "get-all-department"),
    getAlDepartment
  );
  router.get("/get-with-rule", getDepartmentWithRule);
  router.post("/check-permission", checkPermission);
  return app.use("/department", router);
};
