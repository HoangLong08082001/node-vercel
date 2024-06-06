import { createEmployee, getAllEmployee, loginEmployee } from "./EmployeeController";

const express = require("express");
const router = express.Router();
export default function EmployeeRoutes(app) {
  router.post("/create", createEmployee);
  router.get('/get-all',getAllEmployee)
  router.post("/login", loginEmployee);
  return app.use("/employee", router);
}
