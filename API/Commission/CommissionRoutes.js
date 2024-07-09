const express = require("express");
const {
  getAllCommission,
  getByIdCommission,
} = require("./CommissionController");
const readLog = require("../logs/Logs");
const router = express.Router();
module.exports = function CommissionRoutes(app) {
  router.use(readLog);
  router.get(
    "/get-all",
    (req, res, next) => {
      req.app.set("name", "Lấy danh sách Hoa hồng");
      next();
    },
    getAllCommission
  );
  router.get(
    "/get-by-id/:id",
    (req, res, next) => {
      req.app.set("name", `Lấy thông tin chi tiết hoa hồng ${req.params.id}`);
      next();
    },
    getByIdCommission
  );
  app.use("/commission", router);
};
