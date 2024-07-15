class ServicePayment {
  static addpayment() {
    return "INSERT INTO payment (total_recived, temp_balance, total_withdrawn, total_pending, id_collaborator) VALUES (?,?,?)";
  }
  static getTotalRecived() {
    return "SELECT * FROM payment WHERE id_collaborator=?";
  }
  static addWithdraw() {
    return "INSERT INTO withdraw (date_request, initial_balance, amount_pending, amount_transferred,status_transferred, id_collaborator) VALUES(?,?,?,?,?,?)";
  }
  static updateStatusDate() {
    return "UPDATE withdraw SET status_transferred=1, date_transferred=? WHERE id_collaborator=?";
  }
  static updateRecivedAfterTransfer() {
    return "UPDATE payment SET total_recived=?, total_withdrawn=? WHERE id_collaborator=?";
  }
  static getAmountWithDraw() {
    return "SELECT * FROM withdraw WHERE id_collaborator=? ORDER BY id_withdraw ASC LIMIT 1";
  }
  static getAllDraw() {
    return "SELECT collaborator.id_collaborator, collaborator.name_collaborator, collaborator.email_collaborator, collaborator.phone, collaborator.avatar, withdraw.id_withdraw, withdraw.initial_balance, withdraw.amount_pending, withdraw.amount_transferred, withdraw.date_transferred, withdraw.status_transferred, withdraw.available_balance, DATE_FORMAT(DATE_ADD(withdraw.date_request, INTERVAL 7 HOUR), '%d-%m-%Y') AS date_requested, (SELECT MAX(withdraw.date_request) FROM withdraw) as max_date, (SELECT MIN(withdraw.date_request) FROM withdraw) as min_date FROM withdraw join collaborator on withdraw.id_collaborator = collaborator.id_collaborator;";
  }
  static getAllPayment() {
    return "SELECT * FROM payment join collaborator on collaborator.id_collaborator = payment.id_collaborator";
  }
  static getAll() {
    return "SELECT commission.id_commission, commission.personal_tax, commission.affiliate_commission, commission.total_price, commission.direct_commission, commission.indirect_commission, DATE_FORMAT(DATE_ADD(commission.create_at, INTERVAL 7 HOUR), '%d-%m-%Y') AS date_created , commission.time_at, commission.actually_recived, orders.id_orders, orders.id_orders_sapo, orders.financial_status, orders.fulfillment_status, orders.status, orders.customer_phone, collaborator.id_collaborator, collaborator.name_collaborator, collaborator.email_collaborator, collaborator.phone, collaborator.avatar, (SELECT MAX(commission.create_at) FROM commission) as max_date, (SELECT MIN(commission.create_at) FROM commission) as min_date  FROM commission join collaborator on commission.id_collaborator = collaborator.id_collaborator join orders on commission.id_orders = orders.id_orders;";
  }
}

module.exports = ServicePayment;
