class ServicePayment {
  static addpayment() {
    return "INSERT INTO payment (total_recived, temp_balance, total_withdrawn, total_pending, id_collaborator) VALUES (?,?,?,?,?)";
  }
  static getTotalRecived() {
    return "SELECT * FROM payment WHERE id_collaborator=?";
  }
  static addWithdraw() {
    return "INSERT INTO withdraw (date_request, initial_balance, amount_pending, amount_transferred,status_transferred, id_collaborator) VALUES(?,?,?,?,?,?)";
  }
  static updateStatusDate() {
    return "UPDATE withdraw SET status_transferred=1, date_transferred=? WHERE id_collaborator=? ";
  }
  static updateRecivedAfterTransfer() {
    return "UPDATE payment SET total_recived=?, total_withdrawn=? WHERE id_collaborator=?";
  }
  static getAmountWithDraw() {
    return "SELECT * FROM withdraw WHERE id_collaborator IN(?) AND status_transferred=0 ORDER BY id_withdraw ASC LIMIT 1";
  }
  static getAllDraw() {
    return "SELECT collaborator.id_collaborator, collaborator.name_collaborator, collaborator.email_collaborator, collaborator.phone, collaborator.avatar, withdraw.id_withdraw, withdraw.initial_balance, withdraw.amount_pending, withdraw.amount_transferred, withdraw.date_transferred, withdraw.status_transferred, withdraw.available_balance, DATE_FORMAT(DATE_ADD(withdraw.date_request, INTERVAL 7 HOUR), '%d-%m-%Y') AS date_requested, (SELECT MAX(CONVERT_TZ(withdraw.date_request, '+00:00', '+07:00')) FROM withdraw) as max_date, (SELECT MIN(withdraw.date_request) FROM withdraw) as min_date FROM withdraw join collaborator on withdraw.id_collaborator = collaborator.id_collaborator;";
  }
  static getAllPayment() {
    return "SELECT * FROM payment join collaborator on collaborator.id_collaborator = payment.id_collaborator";
  }
  static getAll() {
    return "SELECT commission.id_commission, commission.personal_tax, commission.affiliate_commission, commission.total_price, commission.direct_commission, commission.indirect_commission, DATE_FORMAT(DATE_ADD(commission.create_at, INTERVAL 7 HOUR), '%d-%m-%Y') AS date_created , commission.time_at, commission.actually_recived, orders.id_orders, orders.id_orders_sapo, orders.financial_status, orders.fulfillment_status, orders.status, orders.customer_phone, collaborator.id_collaborator, collaborator.name_collaborator, collaborator.email_collaborator, collaborator.phone, collaborator.avatar, (SELECT MAX(commission.create_at) FROM commission) as max_date, (SELECT MIN(commission.create_at) FROM commission) as min_date  FROM commission join collaborator on commission.id_collaborator = collaborator.id_collaborator join orders on commission.id_orders = orders.id_orders;";
  }
  static updatePayment() {
    return "UPDATE payment SET temp_balance=? WHERE payment.id_collaborator = ?";
  }
  static insertWithdraw() {
    return "INSERT INTO withdraw (date_request, initial_balance, amount_pending, amount_transferred, status_transferred, type_transferred, available_balance, id_collaborator) VALUES (?,?,?,?,?,?,?,?)";
  }
  static updatePayment2() {
    return "UPDATE payment SET total_recived = ? WHERE payment.id_collaborator = ?";
  }
  static updatePayment3() {
    return "UPDATE payment SET total_pending = ? WHERE payment.id_collaborator=?";
  }
  static checkPaymentByIdColla() {
    return "SELECT * FROM payment WHERE id_collaborator = ?";
  }
  static updateWithdraw() {
    return "UPDATE withdraw SET available_balance=? WHERE withdraw.id_collaborator=? AND withdraw.id_withdraw=?";
  }
  static checkWithdraw() {
    return "SELECT * FROM withdraw WHERE withdraw.id_withdraw IN (?) ";
  }
  static checkWihdrawStatusNone() {
    return "SELECT * FROM withdraw WHERE id_collaborator=? AND id_withdraw=? AND status_transferred = 0";
  }
  static updateWithdrawByIDWithdraw(){
    return "UPDATE withdraw SET date_transferred=?, time_transferred=?, status_transferred=1, available_balance=? WHERE id_withdraw = ?";
  }
  static checkSumType1(){
    return "SELECT SUM(withdraw.amount_transferred) as total_withdraw, withdraw.amount_transferred, payment.total_recived, payment.total_pending, payment.total_withdrawn FROM withdraw join payment on withdraw.id_collaborator = payment.id_collaborator WHERE withdraw.id_collaborator = ? AND withdraw.type_transferred = 1";
  }
  static updatePaymentSetTotal(){
    return "UPDATE payment SET total_withdrawn = ? WHERE id_collaborator = ?";
  }
  static getDataChart(){
    return "SELECT DATE(commission.create_at) as date, SUM(commission.actually_recived) as total FROM commission WHERE commission.create_at >= CURDATE() - INTERVAL 7 DAY AND commission.id_collaborator = ? GROUP BY DATE(commission.create_at);"
  }
}

module.exports = ServicePayment;
