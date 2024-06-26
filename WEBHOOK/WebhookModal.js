const handleCommission = (total_price, personal_tax, affiliate_tax) => {
  let tax = total_price * (affiliate_tax / 100) * (personal_tax / 100);
  return total_price * (affiliate_tax / 100) - tax;
};

class ServiceWebhook {
  static checkAffiliateLevel1 =
    "SELECT * FROM collaborator WHERE id_collaborator=? AND presenter_phone=?";
  static checkAffiliateLevel2 =
    "SELECT * FROM collaborator WHERE id_collaborator=?";
  static insertOrder =
    "INSERT INTO orders (id_orders_sapo, date_created, financial_status, fulfillment_status, customer_phone, email, status, total_price, date_delivered, referral_link) VALUES(?,?,?,?,?,?,?,?,?,?)";
  static getAllOrders =
    "SELECT * FROM orders ORDER BY orders.id_orders DESC LIMIT 1";
  static checkCollaborator =
    "SELECT * FROM collaborator WHERE id_collaborator=?";
  static updatePayment =
    "UPDATE payment SET total_recived=? WHERE id_collaborator=? ";
  static checkPayment =
    "SELECT payment.total_recived FROM payment WHERE id_collaborator=? ";
  static countTotal = "SELECT COUNT(*) as total FROM orders";
  static getLast = "SELECT * FROM orders";
  static checkIdSapo = "SELECT * FROM orders WHERE id_orders_sapo=?";
  static checkPhoneEmailOrder = "SELECT * FROM orders WHERE customer_phone = ?";
}

module.exports = {
  handleCommission,
  ServiceWebhook,
};
