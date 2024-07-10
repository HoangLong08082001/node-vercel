const { authenticationToken } = require("../../middleware/JwtAction");

const {
  getOrdersByReferralLink,
  getAll,
  filterDate,
} = require("./OrdersController");

const express = require("express");
const router = express.Router();
module.exports = function OrdersRoutes(app) {
  router.get("/get-order-by/:id", authenticationToken, getOrdersByReferralLink);
  router.get(
    "/get-all",
    (req, res, next) => {
      req.app.set("name", "Lấy danh sách tất cả đơn hàng");
      next();
    },
    getAll
  );
  router.get("/filter/:date1/:date2", filterDate);
  return app.use("/orders", router);
};
