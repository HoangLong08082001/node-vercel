const { authenticationToken } = require("../../middleware/JwtAction");
const readLog = require("../logs/Logs");
const {
  createCampaign,
  deleteCampaign,
  getAllCampaign,
  addProductToCampaign,
  blockCampaign,
  getTagsProducts,
  addCampaignCollaborator,
  countCollaboratorOnCampaign,
} = require("./CampaignController");

const express = require("express");
const router = express.Router();

module.exports = function CampaignRoutes(app) {
  router.use(readLog);
  router.post(
    "/create",
    (req, res, next) => {
      req.app.set("name", "Tạo chiến dịch mới");
      next();
    },
    authenticationToken,
    createCampaign
  );
  router.delete(
    "/delete/:id",
    (req, res, next) => {
      req.app.set("name", "Xoá chiến dịch");
      next();
    },
    authenticationToken,
    deleteCampaign
  );
  router.get("/all-campaign", authenticationToken, getAllCampaign);
  router.post(
    "/add-product-campaign",
    (req, res, next) => {
      req.app.set("name", "Thêm sản phẩm vào chiến dịch");
      next();
    },
    authenticationToken,
    addProductToCampaign
  );
  router.put(
    "/block/:id",
    (req, res, next) => {
      req.app.set("name", "Thay đổi trạng thái chiến dịch");
      next();
    },
    authenticationToken,
    blockCampaign
  );
  router.get("/get-tags-products/:id", authenticationToken, getTagsProducts);
  router.post(
    "/add-campaign-collaborator",
    authenticationToken,
    addCampaignCollaborator
  );
  router.get(
    "/get-count-collaborator/:id",
    authenticationToken,
    countCollaboratorOnCampaign
  );
  return app.use("/campaign", router);
};
