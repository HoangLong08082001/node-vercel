class ServiceOrder {
  static getOrdersHaveReferralLink() {
    return "SELECT * FROM orders WHERE referral_link LIKE '%/?bwaf=%'";
  }
  static checkRefferalHave() {
    return "SELECT * FROM orders WHERE referral_link IN ('/', '/password', '')";
  }
  static getAllOrders() {
    return "SELECT *, (SELECT MIN(date_delivered) FROM orders) AS min_date, (SELECT MAX(date_delivered) FROM orders) AS max_date FROM orders join commission on orders.id_orders = commission.id_orders";
  }
}
module.exports = { ServiceOrder };
