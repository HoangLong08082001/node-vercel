class ServiceCommission {
  static getAll() {
    return "SELECT commission.id_commission, commission.personal_tax, commission.affiliate_commission, commission.total_price, commission.direct_commission, commission.indirect_commission, DATE_FORMAT(DATE_ADD(commission.create_at, INTERVAL 7 HOUR), '%d-%m-%Y') AS date_created , commission.time_at, commission.actually_recived, orders.id_orders, orders.id_orders_sapo, orders.financial_status, orders.fulfillment_status, orders.status, orders.customer_phone, collaborator.id_collaborator, collaborator.name_collaborator, collaborator.email_collaborator, collaborator.phone, collaborator.avatar, (SELECT MAX(commission.create_at) FROM commission) as max_date, (SELECT MIN(commission.create_at) FROM commission) as min_date  FROM commission join collaborator on commission.id_collaborator = collaborator.id_collaborator join orders on commission.id_orders = orders.id_orders;";
  }
  static getById() {
    return "SELECT * FROM commission join orders on commission.id_orders = orders.id_orders join collaborator on commission.id_collaborator = collaborator.id_collaborator WHERE commission.id_commission=?";
  }
  static commissionYesterday() {
    return "SELECT SUM(actually_recived) AS total_yesterday FROM commission WHERE create_at = CURDATE() - INTERVAL 1 DAY AND commission.id_collaborator=?";
  }
  static commissionToday() {
    return "SELECT SUM(actually_recived) AS total_today FROM commission WHERE create_at = CURDATE() AND commission.id_collaborator=?";
  }
}

module.exports = ServiceCommission;
