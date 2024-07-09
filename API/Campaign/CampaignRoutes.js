const { authenticationToken } = require("../../middleware/JwtAction");
const readLog = require("../logs/Logs");
const {
  createCampaign,
  deleteCampaign,
  getAllCampaign,
  addProductToCampaign,
} = require("./CampaignController");

const express = require("express");
const router = express.Router();

module.exports = function CampaignRoutes(app) {
  router.use(readLog);
  router.post(
    "/create",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Tạo chiến dịch mới");
      next();
    },
    createCampaign
  );
  router.delete(
    "/delete",
    (req, res, next) => {
      req.app.set("name", "Xoá chiến dịch");
      next();
    },
    deleteCampaign
  );
  router.get(
    "/all-campaign",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Lấy danh sách chiến dịch");
      next();
    },
    getAllCampaign
  );
  router.post(
    "/add-product-campaign",
    authenticationToken,
    (req, res, next) => {
      req.app.set("name", "Thêm sản phẩm vào chiến dịch");
      next();
    },
    addProductToCampaign
  );
  return app.use("/campaign", router);
};
