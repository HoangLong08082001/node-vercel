const express = require("express");
const {
  drawCommission,
  confirmTransfer,
  getDraws,
  getAllPayment,
} = require("./PaymentController");
const { authenticationToken } = require("../../middleware/JwtAction");
const readLog = require("../logs/Logs");
const router = express.Router();
module.exports = function PaymentRoutes(app) {
  router.use(readLog);
  router.post(
    "/draw",
    (req, res, next) => {
      req.app.set("name", "Thực hiện lệnh rút");
      next();
    },
    authenticationToken,
    drawCommission
  );
  router.put(
    "/confirm/:id",
    (req, res, next) => {
      req.app.set("name", "Xác nhận đã chuyển khoản");
      next();
    },
    authenticationToken,
    confirmTransfer
  );
  router.get(
    "/get-draws",
    (req, res, next) => {
      req.app.set("name", "Lấy danh sách tất cả lệnh rút");
      next();
    },
    authenticationToken,
    getDraws
  );
  router.get("/all-payment", authenticationToken, getAllPayment);
  return app.use("/commission", router);
};
