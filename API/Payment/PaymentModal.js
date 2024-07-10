class ServicePayment {
  static addpayment() {
    return "INSERT INTO payment (total_recived, total_withdrawn, id_collaborator) VALUES (?,?,?)";
  }
  static getTotalRecived() {
    return "SELECT * FROM payment WHERE id_collaborator=?";
  }
  static addWithdraw() {
    return "INSERT INTO withdraw (date_request, amount_transferred, status_transferred, id_collaborator) VALUES(?,?,?,?)";
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
    return "SELECT * FROM withdraw join collaborator on withdraw.id_collaborator = collaborator.id_collaborator join ";
  }
  static getAllPayment(){
    return "SELECT * FROM payment join collaborator on collaborator.id_collaborator = payment.id_collaborator";
  }
}

module.exports = ServicePayment;
