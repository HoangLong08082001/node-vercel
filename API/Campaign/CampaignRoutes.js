const {
  createCampaign,
  deleteCampaign,
  getAllCampaign,
  addProductToCampaign,
} = require ("./CampaignController");

const express = require("express");
const router = express.Router();

module.exports = function CampaignRoutes(app) {
  router.post("/create", app.set("name", "Tạo chiến dịch mới"), createCampaign);
  router.delete("/delete", app.set("name", "Xoá chiến dịch"), deleteCampaign);
  router.get(
    "/all-campaign",
    app.set("name", "Lấy danh sách chiến dịch"),
    getAllCampaign
  );
  router.post("/add-product-campaign", addProductToCampaign);
  return app.use("/campaign", router);
};
