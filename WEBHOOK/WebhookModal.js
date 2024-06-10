const handleCommission = (total_price, personal_tax, affiliate_tax) => {
  let tax = total_price * (affiliate_tax / 100) * (personal_tax / 100);
  return total_price * (affiliate_tax / 100) - tax;
};

class ServiceWebhook {
  static insertOrder =
    "INSERT INTO orders (id_orders_sapo, financial_status, fulfillment_status, status, total_price, referral_link) VALUES ? ON DUPLICATE KEY UPDATE id_orders_sapo = VALUES(id_orders_sapo), financial_status = VALUES(financial_status), fulfillment_status = VALUES(fulfillment_status), status = VALUES(status), total_price = VALUES(total_price), referral_link = VALUES(referral_link)";
  static getAllOrders =
    "SELECT * FROM orders ORDER BY orders.id_orders DESC LIMIT 1";
  static checkCollaborator =
    "SELECT * FROM collaborator WHERE id_collaborator=?";
  static updatePayment =
    "UPDATE payment SET total_withdrawn=? WHERE id_collaborator=? ";
  static checkPayment =
    "SELECT payment.total_withdrawn FROM payment WHERE id_collaborator=? ";
  static countTotal = "SELECT COUNT(*) as total FROM orders";
  static getLast = "SELECT * FROM orders";
}

module.exports = {
  handleCommission,
  ServiceWebhook,
};
