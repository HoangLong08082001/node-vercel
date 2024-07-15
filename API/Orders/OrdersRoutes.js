const { authenticationToken } = require("../../middleware/JwtAction");

const {
  getOrdersByReferralLink,
  getAll,
  filterDate,
  allOrder,
  getOrdersByReferralLinkTeam,
  getDataChartOrder,
} = require("./OrdersController");

const express = require("express");
const router = express.Router();
module.exports = function OrdersRoutes(app) {
  router.get("/get-order-by/:id", authenticationToken, getOrdersByReferralLink);
  router.get(
    "/get-orders-team-by/:id",
    authenticationToken,
    getOrdersByReferralLinkTeam
  );
  router.get(
    "/get-all",
    (req, res, next) => {
      req.app.set("name", "Lấy danh sách tất cả đơn hàng");
      next();
    },
    authenticationToken,
    getAll
  );
  router.get("/all-orders", authenticationToken, allOrder);
  return app.use("/orders", router);
};
