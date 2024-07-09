class ServiceOrder {
  static getOrdersHaveReferralLink() {
    return "SELECT * FROM orders WHERE referral_link LIKE '%/?bwaf=%'";
  }
  static checkRefferalHave() {
    return "SELECT * FROM orders WHERE referral_link IN ('/', '/password', '')";
  }
  static getAllOrders() {
    return "SELECT * FROM orders";
  }
}
module.exports = { ServiceOrder };
