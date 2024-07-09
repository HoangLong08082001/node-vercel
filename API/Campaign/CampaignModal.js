class ServiceCampaign {
  static create() {
    return "INSERT INTO campaign (image, link_product, name_campaign, commission, description, date_start, date_end) VALUES (?,?,?,?,?,?,?)";
  }
  static getCampWithRule() {
    return "SELECT * FROM campaign JOIN campaign_products ON campaign.id_campaign = campaign_products.id_campaign JOIN products ON campaign_products.id_products = products.id_products";
  }
  static getCampaignWithProduct() {
    return "SELECT campaign.id_campaign, campaign.name_campaign, products.id_products, products.id_products_sapo, campaign.link_product, products.alias, campaign.description, campaign.date_start, campaign.date_end, campaign.commission, campaign.image, products.image_product, products.name_product FROM campaign LEFT JOIN campaign_products ON campaign.id_campaign = campaign_products.id_campaign LEFT JOIN products ON campaign_products.id_products = products.id_products";
  }
  static getCampaignById() {
    return "SELECT id_products FROM campaign_products WHERE id_campaign = ?";
  }
  static addProductIntoCampaign() {
    return "INSERT INTO campaign_products (id_campaign, id_products) VALUES ?";
  }
  static deleteCampaignByIdCamAndProduct(){
    return "DELETE FROM campaign_products WHERE id_campaign = ? AND id_products IN (?)";
  }
  static checkDeleteCampaign(){
    return "SELECT * FROM campaign join campaign_products on campaign.id_campaign = campaign_products.id_campaign join collaborator_campaign on campaign.id_campaign = collaborator_campaign.id_campaign join team_campaign on campaign.id_campaign = team_campaign.id_campaign WHERE campaign_products.id_campaign IN (?) OR collaborator_campaign.id_campaign IN (?) OR team_campaign.id_campaign IN (?)";
  }
  static checkCampaign(){
    return "SELECT * FROM campaign WHERE id_campaign IN (?)"
  }
  static deleteCampaign(){
    return "DELETE FROM campaign WHERE campaign.id_campaign IN (?)"
  }
}
module.exports = { ServiceCampaign };
