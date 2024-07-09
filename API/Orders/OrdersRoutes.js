const { authenticationToken } = require("../../middleware/JwtAction");

const { getOrdersByReferralLink, getAll } = require("./OrdersController");

const express = require("express");
const router = express.Router();
module.exports = function OrdersRoutes(app) {
  router.get("/get-order-by/:id", authenticationToken, getOrdersByReferralLink);
  router.get(
    "/get-all",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Lấy danh sách tất cả đơn hàng");
      next();
    },
    getAll
  );
  return app.use("/orders", router);
};
