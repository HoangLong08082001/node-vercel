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
        const campaign = {};
        let url = null;
        data.forEach((row) => {
          url = row.link_product;
          if (!campaign[row.name_campaign]) {
            campaign[row.name_campaign] = {
              name: row.name_campaign,
              products: [],
            };
          }
          campaign[row.name_campaign].products.push({
            alias: url + row.alias + "/?bwaf=",
          });
        });
        return res.status(200).json({ data: campaign });
      }
    }
  );
};

module.exports = { createCampaign, deleteCampaign, getAllCampaign };
