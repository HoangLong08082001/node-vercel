const express = require("express");
const {
  drawCommission,
  confirmTransfer,
  getDraws,
  getAllPayment,
  getAllCommission,
  getDataChartOrder,
  getDataCollaboratorWithdrawal,
} = require("./PaymentController");
const { authenticationToken } = require("../../middleware/JwtAction");
const readLog = require("../logs/Logs");
const router = express.Router();
module.exports = function PaymentRoutes(app) {
  router.use(readLog);
  router.post(
    "/draw",
    (req, res, next) => {
      req.app.set("id", req.body.phone);
      req.app.set("name", `${req.body.phone} thực hiện lệnh rút`);
      next();
    },
    authenticationToken,
    drawCommission
  );

  router.get("/get-draws",authenticationToken, getDraws);
  router.get("/get-all", authenticationToken, getAllCommission);
  router.get("/all-payment", authenticationToken, getAllPayment);
  router.get("/data-chart/:id", authenticationToken, getDataChartOrder);
  return app.use("/commission", router);
};
