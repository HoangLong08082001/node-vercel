import { createCampaign, deleteCampaign, getAllCampaign } from "./CampaignController";

const express = require("express");
const router = express.Router();

export default function CampaignRoutes(app) {
  router.post("/create", createCampaign);
  router.delete("/delete", deleteCampaign);
  router.get('/all-campaign', getAllCampaign)
  return app.use("/campaign", router);
}
