import { getOrdersByReferralLink } from "./OrdersController";

const express = require("express");
const router = express.Router();
export default function OrdersRoutes(app) {
  router.get("/get-order-by/:id",getOrdersByReferralLink);
  return app.use("/orders", router);
}
