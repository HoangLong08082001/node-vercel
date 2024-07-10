const { authenticationToken } =require ("../../middleware/JwtAction");
const readLog = require("../logs/Logs");
const { getProducts } = require ("./ProductController");

const express = require("express");
const router = express.Router();

function ProductRoutes(app) {
  router.use(readLog)
  router.get(
    "/get-all",
    (req, res, next) => {
      req.app.set("name", "Lấy danh sách sản phẩm");
      next();
    },
    authenticationToken,
    getProducts
  );
  return app.use("/product", router);
}
module.exports = ProductRoutes;
