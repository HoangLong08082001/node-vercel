const express = require("express");
const { getBanners, addBanners, updateBanners, blockBanner } = require("./BannerController");
const { authenticationToken } = require("../../middleware/JwtAction");
const router = express.Router();

module.exports = function BannerRoutes(app) {
  router.get("/get-banners", authenticationToken, getBanners);
  router.post("/add-banners", authenticationToken, addBanners);
  router.put("/update-banner", authenticationToken, updateBanners);
  router.put('/lock-banner', authenticationToken, blockBanner);
  app.use("/banner", router);
};
