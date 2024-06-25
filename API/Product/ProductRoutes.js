import { getProducts } from "./ProductController";

const express = require("express");
const router = express.Router();

export default function ProductRoutes(app) {
  router.get("/get-all", getProducts);
  return app.use("/product", router);
}
