const express = require("express");
const {
  getAllCommission,
  getByIdCommission,
  compareCommission,
} = require("./CommissionController");
const readLog = require("../logs/Logs");
const { authenticationToken } = require("../../middleware/JwtAction");
const {
  getDataCollaboratorWithdrawal,
  getListConfirm,
  confirmTransfer,
} = require("../Payment/PaymentController");
const router = express.Router();
module.exports = function CommissionRoutes(app) {
  router.use(readLog);
  router.get(
    "/get-all",
    authenticationToken,
    getAllCommission
  );
  router.get(
    "/get-by-id/:id",
    authenticationToken,
    getByIdCommission
  );
  router.get("/get-percent/:id", authenticationToken, compareCommission);
  router.get(
    "/get-total-withdraw",
    authenticationToken,
    getDataCollaboratorWithdrawal
  );
  router.get("/get-list-confirm", authenticationToken, getListConfirm);
  router.put(
    "/confirm",
    (req, res, next) => {
      req.app.set("name", `Xác nhận đã chuyển khoản ${req.body}`);
      next();
    },
    authenticationToken,
    confirmTransfer
  );
  app.use("/payment", router);
};
