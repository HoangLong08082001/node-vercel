const handleCommission = (total_price, personal_tax, affiliate_tax) => {
  let tax = total_price * (affiliate_tax / 100) * (personal_tax / 100);
  return total_price * (affiliate_tax / 100) - tax;
};

class ServiceWebhook {
  static insertOrder =
    "INSERT INTO orders (id_orders_sapo,financial_status, fulfillment_status, status, total_price, referral_link) VALUES(?,?,?,?,?,?)";
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
  static checkIdSapo = "SELECT * FROM orders WHERE id_orders_sapo=?";
  
}

module.exports = {
  handleCommission,
  ServiceWebhook,
};
