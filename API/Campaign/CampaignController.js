const pool = require("../../config/database.js");
const { ServiceCampaign } = require("./CampaignModal.js");

//id_collaborator	id_orders	link_product	name_campaign	personal_tax	affiliate_tax	description	date_start	date_end
const createCampaign = (req, res) => {
  let link = req.body.link;
  let name = req.body.name;
  let personal_tax = req.body.personal_tax;
  let affiliate_tax = req.body.affiliate_tax;
  let description = req.body.description;
  let date_start = req.body.date_start;
  let date_end = req.body.date_end;
  pool.query(
    ServiceCampaign.create,
    [
      link,
      name,
      personal_tax,
      affiliate_tax,
      description,
      date_start,
      date_end,
    ],
    (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        return res.status(200).json({ message: "success" });
      }
    }
  );
};
const deleteCampaign = (req, res) => {
  return res.send("Delete");
};

const getAllCampaign = (req, res) => {
  pool.query(
    "SELECT * FROM campaign JOIN campaign_products ON campaign.id_campaign = campaign_products.id_campaign JOIN products ON campaign_products.id_products = products.id_products",
    [],
    (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        const campaigns = [];

        data.forEach((row) => {
          const { id_campaign, name_campaign, id_products_sapo, link_product, alias } = row;

          // Tìm chiến dịch hiện tại trong mảng
          let campaign = campaigns.find((c) => c.id === id_campaign);

          // Nếu chiến dịch chưa tồn tại trong mảng, thêm vào
          if (!campaign) {
            campaign = {
              id: id_campaign,
              name: name_campaign,
              products: [],
            };
            campaigns.push(campaign);
          }

          // Thêm sản phẩm vào danh sách sản phẩm của chiến dịch
          campaign.products.push({
            id: id_products_sapo,
            alias: link_product + alias,
          });
        });
        return res.status(200).json({ message: "success", data: campaigns });
      }
    }
  );
};

module.exports = { createCampaign, deleteCampaign, getAllCampaign };
