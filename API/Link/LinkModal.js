class LinkService {
  static getAllLink() {
    return "SELECT * FROM link_website";
  }
  static checkExistLinks() {
    return "SELECT * FROM link_website WHERE link_website.id_link = ?";
  }
  static updateLink() {
    return "UPDATE link_website SET link = ? , date_updated = ?, time_updated = ? WHERE id_link = ?";
  }
  static checkExistAddLink() {
    return "SELECT * FROM link_website WHERE link = ?";
  }
  static addLink() {
    return "INSERT INTO link_website (link, date_created, time_created) VALUES (?,?,?)";
  }
  static getNewLink() {
    return "SELECT * FROM `link_website` ORDER BY link_website.id_link DESC LIMIT 1;";
  }
}

module.exports = LinkService;
