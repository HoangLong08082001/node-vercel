class ServiceCampaign {
  static create =
    "INSERT INTO campaign (image, link_product, name_campaign, commission, description, date_start, date_end) VALUES (?,?,?,?,?,?,?)";
  static getCampWithRule =
    "SELECT * FROM campaign JOIN campaign_products ON campaign.id_campaign = campaign_products.id_campaign JOIN products ON campaign_products.id_products = products.id_products";
}
module.exports = { ServiceCampaign };
