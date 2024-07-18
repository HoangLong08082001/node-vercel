class ServiceOrder {
  static getOrdersHaveReferralLink() {
    return "SELECT * FROM orders join commission on orders.id_orders = commission.id_orders WHERE referral_link LIKE '%/?bwaf=%' AND financial_status like 'paid' AND fulfillment_status like 'fulfilled' ";
  }
  static checkRefferalHave() {
    return "SELECT * FROM orders join commission on orders.id_orders = commission.id_orders WHERE referral_link IN ('/', '/password', '') AND financial_status like 'paid' AND fulfillment_status like 'fulfilled'";
  }
  static getAllOrders() {
    return "SELECT orders.id_orders, orders.id_orders_sapo, orders.customer_phone, orders.total_price, tax.before_tax, tax.tax_rate, commission.direct_commission, commission.indirect_commission, commission.actually_recived,DATE_FORMAT(DATE_ADD(date_delivered, INTERVAL 7 HOUR), '%d-%m-%Y') AS date_created, (SELECT MIN(date_delivered) FROM orders) AS min_date, (SELECT MAX(date_delivered) FROM orders) AS max_date FROM orders join commission on orders.id_orders = commission.id_orders join tax on tax.id_orders = commission.id_orders GROUP by commission.id_commission;";
  }
  static allOrders() {
    return "SELECT * FROM orders";
  }
  static filterOrders(){
    return "SELECT * FROM orders join commission on orders.id_orders = commission.id_orders WHERE ";
  }
}
module.exports = { ServiceOrder };
