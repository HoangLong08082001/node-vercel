class BannerService {
  static getAllBanner() {
    return "SELECT * FROM banner_app";
  }
  static addNewBanner() {
    return "INSERT INTO banner_app (image, link_website, status, date_created, time_created) VALUES (?,?,?,?,?)";
  }
  static checkExistsBanner() {
    return "SELECT * FROM banner_app WHERE link_website = ? AND id_banner = ?";
  }
  static updateBanner() {
    return "UPDATE banner_app SET image=?, link_website=? WHERE id_banner = ?";
  }
  static checkIdBanner(){
    return "SELECT * FROM banner_app WHERE id_banner IN (?) AND status = 0";
  }
  static updateTrue(){
    return "UPDATE banner_app SET status = 1 WHERE id_banner IN (?)";
  }
  static updateFalse(){
    return "UPDATE banner_app SET status = 0 WHERE id_banner IN (?)";
  }
}
module.exports = BannerService;
