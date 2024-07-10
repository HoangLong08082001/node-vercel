const handleCommission = (total_price, personal_tax, affiliate_tax) => {
  let tax = total_price * (affiliate_tax / 100) * (personal_tax / 100);
  return total_price * (affiliate_tax / 100) - tax;
};

class ServiceWebhook {
  static checkAffiliateLevel1() {
    return "SELECT * FROM collaborator WHERE id_collaborator=? AND presenter_phone=?";
  }
  static checkAffiliateLevel2() {
    return "SELECT * FROM collaborator WHERE id_collaborator=?";
  }
  static insertOrder() {
    return "INSERT INTO orders (id_orders_sapo, date_created, financial_status, fulfillment_status, customer_phone, email, status, total_price, referral_link) VALUES(?,?,?,?,?,?,?,?,?)";
  }
  static getAllOrders() {
    return "SELECT * FROM orders ORDER BY orders.id_orders DESC LIMIT 1";
  }
  static checkCollaborator() {
    return "SELECT * FROM collaborator WHERE id_collaborator=?";
  }
  static updatePayment() {
    return "UPDATE payment SET total_recived=? WHERE id_collaborator=? ";
  }
  static checkPayment() {
    return "SELECT payment.total_recived, payment.id_collaborator, collaborator.status_account FROM payment join collaborator on collaborator.id_collaborator = payment.id_collaborator WHERE payment.id_collaborator=? ";
  }
  static countTotal() {
    return "SELECT COUNT(*) as total FROM orders";
  }
  static getLast() {
    return "SELECT * FROM orders";
  }
  static checkIdSapo() {
    return "SELECT * FROM orders WHERE id_orders_sapo=?";
  }
  static checkPhoneEmailOrder() {
    return "SELECT * FROM orders WHERE customer_phone = ?";
  }
  static addCommission(){
    return "INSERT INTO commission (personal_tax, affiliate_commission, total_price, commission_net, id_collaborator, create_at, id_orders) VALUES(?,?,?,?,?,?,?)";
  }
}

module.exports = {
  handleCommission,
  ServiceWebhook,
};
